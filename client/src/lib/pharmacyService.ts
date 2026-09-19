import citiesDataJson from "@shared/cities.json";
import { TURKEY_DISTRICTS, toTurkishSlug } from "@shared/turkeyDistricts";
import {
  calculateDistanceKm,
  TURKEY_CITY_COORDINATES,
} from "./turkeyGeoData";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const USE_SERVER = Boolean(API_BASE_URL) || (typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port === "3000");

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
}

export interface RawPharmacy {
  id: string;
  name: string;
  address: string | null;
  landmark?: string | null;
  addressDescription?: string | null;
  phone: string;
  phone2?: string | null;
  location: PharmacyLocation;
  city: PharmacyCity;
  district: PharmacyDistrict;
  duty: PharmacyDuty;
  dataQuality?: PharmacyDataQuality;
  distance?: number;
}

export interface DayDutyGroup {
  day?: string;
  date: string;
  count: number;
  pharmacies: RawPharmacy[];
}

export interface FetchResult {
  success: boolean;
  days: DayDutyGroup[];
  sourceName: string;
  wasCacheHit?: boolean;
  error?: string;
}

/**
 * Get static list of all 81 cities instantly (0 network cost, zero <!DOCTYPE error)
 */
export function getLocalCities(): Array<{ id: string; name: string; slug: string; plateCode: string; districtsCount?: number; pharmaciesCount?: number }> {
  return (citiesDataJson?.data || []) as any[];
}

/**
 * Get districts for a given city slug instantly (0 network cost)
 */
export function getLocalDistricts(citySlugOrName: string): string[] {
  const slug = toTurkishSlug(citySlugOrName);
  return TURKEY_DISTRICTS[slug] || [];
}

/**
 * Safely fetches JSON from an endpoint, gracefully catching HTML/DOCTYPE responses
 */
async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  timeoutMs = 6000
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) return null;

    const text = await res.text();
    // Detect HTML responses (Cloudflare block, SPA 404/index fallback)
    if (!text || text.trim().startsWith("<") || text.includes("<!DOCTYPE")) {
      return null;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Attaches distances to pharmacy list (from userLocation if present, otherwise from city center)
 * and strictly sorts all pharmacies by nearest distance first.
 */
function enrichDistances(
  pharmacies: RawPharmacy[],
  userLocation?: { latitude: number; longitude: number } | null,
  citySlugOrName?: string
): RawPharmacy[] {
  const citySlug = citySlugOrName ? toTurkishSlug(citySlugOrName) : "";
  const cityCoords = TURKEY_CITY_COORDINATES[citySlug] || { lat: 39.0, lng: 35.0, areaCode: "0212" };

  const targetLat = userLocation?.latitude || cityCoords.lat;
  const targetLng = userLocation?.longitude || cityCoords.lng;

  const enriched = pharmacies.map((p) => {
    if (p.location?.latitude && p.location?.longitude) {
      const dist = calculateDistanceKm(
        targetLat,
        targetLng,
        p.location.latitude,
        p.location.longitude
      );
      return { ...p, distance: Number(dist.toFixed(2)) };
    }
    // Fallback distance if no coordinates
    return { ...p, distance: undefined };
  });

  return enriched.sort((a, b) => {
    const distA = a.distance ?? 999;
    const distB = b.distance ?? 999;
    return distA - distB;
  });
}

/**
 * Shows only records actually returned by a provider.
 */
function buildSingleDay(
  cityName: string,
  userLocation: { latitude: number; longitude: number } | null | undefined,
  primaryList: RawPharmacy[],
  sourceDate: string
): DayDutyGroup[] {
  const todayList = enrichDistances(primaryList, userLocation, cityName);

  return [
    {
      day: "Bugün",
      date: sourceDate,
      count: todayList.length,
      pharmacies: todayList,
    },
  ];
}

/**
 * Normalize EczaneAdresi list to standard RawPharmacy[]
 */
function mapEczaneAdresiToPharmacies(
  list: any[],
  cityName: string,
  citySlug: string,
  targetDistrict?: string
): RawPharmacy[] {
  return list.map((item: any, i: number) => ({
    id: String(item.id || item.slug || i),
    name: item.name || item.eczane_adi || "Eczane",
    address: item.address || item.adres || "Adres bilgisi mevcut",
    phone: item.phone || item.telefon || "",
    phone2: item.phone2 || null,
    location: {
      latitude: Number(item.lat || item.latitude || (item.location ? item.location.lat : null)) || null,
      longitude: Number(item.lng || item.longitude || (item.location ? item.location.lng : null)) || null,
    },
    city: { name: cityName, slug: citySlug },
    district: {
      name: item.district || targetDistrict || "",
      slug: toTurkishSlug(item.district || targetDistrict || ""),
    },
    duty: {
      date: item.duty?.date || new Date().toISOString().split("T")[0],
      isVerified: Boolean(item.duty?.isVerified),
    },
    distance: item.distance_m ? item.distance_m / 1000 : undefined,
  }));
}

/**
 * Automatic Multi-Source Pool & Fallback Fetcher
 * Tries sources in order without requiring manual user selection:
 * 1. Local Server Proxy (/api/pharmacies/on-duty)
 * 2. EczaneAdresi Public v1 (supports CORS for browser)
 * 3. EczaneAPI Direct
 * 4. High quality authentic city generator fallback with real GPS coordinates for that city
 */
export async function fetchDutyPharmaciesAuto(
  cityName: string,
  districtName?: string,
  userLocation?: { latitude: number; longitude: number } | null
): Promise<FetchResult> {
  const citySlug = toTurkishSlug(cityName);
  const districtSlug = districtName && districtName !== "Tümü" ? toTurkishSlug(districtName) : "";

  // 1. Try Local Server Proxy (with server-side cache & quota management)
  const proxyUrl = `${API_BASE_URL}/api/pharmacies/on-duty?city=${citySlug}${
    districtName && districtName !== "Tümü" ? `&district=${encodeURIComponent(districtName)}` : ""
  }`;

  const proxyRes = USE_SERVER
    ? await safeFetchJson<any>(proxyUrl) : null;
  if (proxyRes && proxyRes.success && proxyRes.data?.days?.length > 0) {
    const threeDays = proxyRes.data.days.map((day: DayDutyGroup) => ({
      ...day,
      pharmacies: enrichDistances(day.pharmacies || [], userLocation, cityName),
    }));

    return {
      success: true,
      days: threeDays,
      sourceName: proxyRes.source || "EczaneAPI",
      wasCacheHit: proxyRes.wasCacheHit,
    };
  }

  // 2. Try EczaneAdresi.com Public v1 API (CORS enabled)
  try {
    let eaUrl = `https://eczaneadresi.com/api/public/v1/duty-pharmacies?city=${citySlug}&limit=50`;
    if (districtSlug) {
      eaUrl += `&district=${encodeURIComponent(districtSlug)}`;
    }
    const eaRes = await safeFetchJson<any>(eaUrl);

    if (eaRes && Array.isArray(eaRes.pharmacies) && eaRes.pharmacies.length > 0) {
      const mapped = mapEczaneAdresiToPharmacies(eaRes.pharmacies, cityName, citySlug, districtName);
      const threeDays = buildSingleDay(cityName, userLocation, mapped, eaRes.date || mapped[0]?.duty?.date || "");
      return {
        success: true,
        days: threeDays,
        sourceName: "EczaneAdresi.com Kamu Servisi",
        wasCacheHit: false,
      };
    }
  } catch (e) {
    // continue to fallback
  }

  return {
    success: false,
    days: [],
    sourceName: "Veri alınamadı",
    error: "Nöbetçi eczane verisi şu anda alınamıyor.",
  };
}

/**
 * Automatic GPS Nearby Multi-Source Fetcher
 */
export async function fetchNearbyPharmaciesAuto(
  latitude: number,
  longitude: number,
  radius = 5
): Promise<FetchResult> {
  const userLoc = { latitude, longitude };

  // 1. Try local proxy
  const proxyUrl = `${API_BASE_URL}/api/pharmacies/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
  const proxyRes = USE_SERVER
    ? await safeFetchJson<any>(proxyUrl) : null;

  if (proxyRes && proxyRes.success && (proxyRes.data?.days?.length > 0 || proxyRes.data?.pharmacies?.length > 0)) {
    const proxyDays: DayDutyGroup[] = proxyRes.data.days || [{ day: "Bugün", date: proxyRes.data.date || "", count: proxyRes.data.pharmacies.length, pharmacies: proxyRes.data.pharmacies }];
    const days = proxyDays.map((d: DayDutyGroup) => ({
      ...d,
      pharmacies: enrichDistances(d.pharmacies, userLoc),
    }));

    return {
      success: true,
      days,
      sourceName: "EczaneAPI GPS Servisi",
      wasCacheHit: proxyRes.wasCacheHit,
    };
  }

  // 2. Try EczaneAdresi Public Nearest
  try {
    const eaUrl = `https://eczaneadresi.com/api/public/v1/nearest-pharmacies?lat=${latitude}&lng=${longitude}&limit=15`;
    const eaRes = await safeFetchJson<any>(eaUrl);

    if (eaRes && Array.isArray(eaRes.pharmacies) && eaRes.pharmacies.length > 0) {
      const mapped = mapEczaneAdresiToPharmacies(eaRes.pharmacies, "Yakın Konum", "yakin-konum");
      const sorted = enrichDistances(mapped, userLoc);
      return {
        success: true,
        days: [
          {
            day: "Yakınınızdaki Nöbetçiler",
            date: eaRes.date || new Date().toISOString().split("T")[0],
            count: sorted.length,
            pharmacies: sorted,
          },
        ],
        sourceName: "EczaneAdresi.com GPS Servisi",
        wasCacheHit: false,
      };
    }
  } catch (e) {
    // continue to fallback
  }

  // 3. Fallback nearby: Find closest Turkish city and generate relative to GPS
  let closestCity = "İstanbul";
  let minDistance = Infinity;

  Object.entries(TURKEY_CITY_COORDINATES).forEach(([cityKey, coords]) => {
    const dist = calculateDistanceKm(latitude, longitude, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
    }
  });

  return fetchDutyPharmaciesAuto(closestCity, undefined, userLoc);
}
