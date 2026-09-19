import { getCache, setCache } from "./cacheService.js";
import { recordExternalRequest, recordCacheHit, loadQuotaState } from "./quotaService.js";
import { toTurkishSlug } from "../../shared/turkeyDistricts.js";

const BASE_URL = "https://eczaneapi.com/api/v1";

function getApiKey(): string {
  const key = process.env.ECZANE_API_KEY;
  if (!key) {
    throw new Error("ECZANE_API_KEY environment variable is required");
  }
  return key;
}

export interface PharmacyLocation {
  latitude: number | null;
  longitude: number | null;
}

export interface PharmacyCity {
  id?: string;
  name: string;
  slug: string;
}

export interface PharmacyDistrict {
  id?: string;
  name: string;
  slug: string;
}

export interface PharmacyDuty {
  date: string;
  isVerified: boolean;
}

export interface PharmacyDataQuality {
  status: "passed" | "rejected" | string;
  code: string | null;
  checks?: string[];
  addressVerified?: boolean;
  validationVersion?: string;
}

export interface RawPharmacy {
  id: string;
  name: string;
  address: string | null;
  phone: string;
  phone2: string | null;
  location: PharmacyLocation;
  city: PharmacyCity;
  district: PharmacyDistrict;
  duty: PharmacyDuty;
  dataQuality?: PharmacyDataQuality;
  distance?: number;
}

export interface DayDutyGroup {
  day?: string; // "Dün", "Bugün", "Yarın"
  date: string;
  count: number;
  pharmacies: RawPharmacy[];
}

export interface OnDutyResponseData {
  days: DayDutyGroup[];
  selectedDay?: DayDutyGroup;
  city: string;
  district?: string;
}

/**
 * Normalizes multi-day response from EczaneAPI.
 * EczaneAPI returns either an array of day objects [{ day: 'Bugün', date: '...', pharmacies: [...] }, ...]
 * or a single day object { date: '...', count: X, pharmacies: [...] }.
 */
function normalizeDays(data: any): DayDutyGroup[] {
  if (Array.isArray(data)) {
    return data.map((d: any) => ({
      day: d.day || (d.date ? "Nöbet" : "Bugün"),
      date: d.date,
      count: Array.isArray(d.pharmacies) ? d.pharmacies.length : (d.count || 0),
      pharmacies: Array.isArray(d.pharmacies) ? d.pharmacies : [],
    }));
  }

  if (data && typeof data === "object") {
    return [
      {
        day: "Bugün",
        date: data.date || new Date().toISOString().split("T")[0],
        count: Array.isArray(data.pharmacies) ? data.pharmacies.length : (data.count || 0),
        pharmacies: Array.isArray(data.pharmacies) ? data.pharmacies : [],
      },
    ];
  }

  return [];
}

/**
 * Fetches on-duty pharmacies with smart caching.
 * Fetching at the city-level captures all districts and 3 days (yesterday, today, tomorrow)
 * in a single API call, saving massive monthly quota.
 */
export async function getOnDutyPharmacies(params: {
  city: string;
  district?: string;
  date?: string;
}) {
  const citySlug = toTurkishSlug(params.city);
  const districtSlug = params.district ? toTurkishSlug(params.district) : "";
  const cacheKey = `on-duty:${citySlug}`;

  // 1. Check City Cache
  let cachedCityData = getCache<any>(cacheKey);
  let wasCacheHit = false;

  if (cachedCityData) {
    wasCacheHit = true;
    recordCacheHit("/pharmacies/on-duty", `city=${citySlug}`, cachedCityData.length || 0);
  } else {
    // 2. Not cached: check remaining quota
    const quota = loadQuotaState();
    if (quota.remaining <= 0) {
      throw {
        status: 429,
        code: "QUOTA_EXCEEDED",
        message: "Aylık 200 sorgu kotanız dolmuştur. Yeni döneme kadar önbelleğe alınmış şehirler gösterilebilir.",
      };
    }

    // 3. Perform external call for the entire city
    const apiKey = getApiKey();
    const url = `${BASE_URL}/pharmacies/on-duty?city=${encodeURIComponent(citySlug)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      let parsedError: any = {};
      try {
        parsedError = JSON.parse(errorBody);
      } catch {}
      throw {
        status: res.status,
        code: parsedError.code || `HTTP_${res.status}`,
        message: parsedError.error || parsedError.message || `API Hatası: ${res.statusText}`,
      };
    }

    const json = (await res.json()) as { success: boolean; data: any };
    cachedCityData = json.data;

    // Cache the entire city's result
    setCache(cacheKey, cachedCityData);

    const count = Array.isArray(cachedCityData)
      ? cachedCityData.reduce((acc: number, d: any) => acc + (d.pharmacies?.length || 0), 0)
      : (cachedCityData.pharmacies?.length || 0);

    recordExternalRequest("/pharmacies/on-duty", `city=${citySlug}`, count);
  }

  // Normalize into standard DayDutyGroup structure
  const allDays = normalizeDays(cachedCityData);

  // Filter pharmacies by district if specified
  const filteredDays: DayDutyGroup[] = allDays.map((dayGroup) => {
    let list = dayGroup.pharmacies;
    if (districtSlug) {
      list = list.filter((p) => {
        const dSlug = p.district?.slug ? toTurkishSlug(p.district.slug) : "";
        const dName = p.district?.name ? toTurkishSlug(p.district.name) : "";
        return dSlug === districtSlug || dName === districtSlug;
      });
    }

    return {
      ...dayGroup,
      count: list.length,
      pharmacies: list,
    };
  });

  // Find active day (default to "Bugün" or today's date or first day)
  const todayStr = new Date().toISOString().split("T")[0];
  let selectedDay = filteredDays.find((d) => d.day === "Bugün" || d.date === todayStr) || filteredDays[0];

  if (params.date) {
    const matchedDate = filteredDays.find((d) => d.date === params.date);
    if (matchedDate) selectedDay = matchedDate;
  }

  return {
    city: params.city,
    district: params.district || "Tümü",
    days: filteredDays,
    selectedDay,
    wasCacheHit,
  };
}

/**
 * Fetches nearby pharmacies based on GPS coordinates.
 * Caches by rounding lat/lng to 2 decimals (~1.1 km accuracy) to reuse requests for nearby users.
 */
export async function getNearbyPharmacies(params: {
  latitude: number;
  longitude: number;
  radius?: number;
}) {
  const radius = params.radius || 5;
  const latRounded = Number(params.latitude).toFixed(2);
  const lonRounded = Number(params.longitude).toFixed(2);
  const cacheKey = `nearby:${latRounded}_${lonRounded}_${radius}`;

  const cached = getCache<any>(cacheKey);
  if (cached) {
    recordCacheHit("/pharmacies/nearby", `lat=${latRounded},lon=${lonRounded}`, cached.pharmacies?.length || 0);
    return {
      ...cached,
      wasCacheHit: true,
    };
  }

  const quota = loadQuotaState();
  if (quota.remaining <= 0) {
    throw {
      status: 429,
      code: "QUOTA_EXCEEDED",
      message: "Aylık 200 sorgu kotanız dolmuştur.",
    };
  }

  const apiKey = getApiKey();
  const url = `${BASE_URL}/pharmacies/nearby?latitude=${encodeURIComponent(params.latitude)}&longitude=${encodeURIComponent(params.longitude)}&radius=${encodeURIComponent(radius)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let parsedError: any = {};
    try {
      parsedError = JSON.parse(errorBody);
    } catch {}
    throw {
      status: res.status,
      code: parsedError.code || `HTTP_${res.status}`,
      message: parsedError.error || parsedError.message || `API Hatası: ${res.statusText}`,
    };
  }

  const json = (await res.json()) as { success: boolean; data: any };
  const data = json.data;

  setCache(cacheKey, data);
  recordExternalRequest("/pharmacies/nearby", `lat=${latRounded},lon=${lonRounded}`, data.pharmacies?.length || 0);

  return {
    ...data,
    wasCacheHit: false,
  };
}
