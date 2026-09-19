import { getCache, setCache } from "./cacheService.js";

const DEFAULT_RAPIDAPI_KEY = "a7e24c58b0msh77c82b128b6c4cbp13426bjsne993e2a38a66";
const RAPIDAPI_HOST = "nobetcieczane.p.rapidapi.com";

function getApiKey(): string {
  return process.env.RAPIDAPI_KEY || DEFAULT_RAPIDAPI_KEY;
}

/**
 * 1. GET /pharmacies-on-duty/cities
 */
export async function getRapidApiCities() {
  const cacheKey = "rapidapi:cities";
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return { ...cached, wasCacheHit: true };
  }

  const url = `https://${RAPIDAPI_HOST}/pharmacies-on-duty/cities`;
  const key = getApiKey();

  try {
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsed = {};
      try { parsed = JSON.parse(errText); } catch {}
      throw {
        status: res.status,
        message: (parsed as any).message || `RapidAPI Hatası: ${res.statusText}`,
      };
    }

    const data = await res.json();
    setCache(cacheKey, data);
    return { ...data, wasCacheHit: false };
  } catch (err: any) {
    console.error("RapidAPI cities error:", err);
    throw err;
  }
}

/**
 * 2. GET /pharmacies-on-duty (by city / district)
 */
export async function getRapidApiPharmacies(params: { city: string; district?: string }) {
  const city = params.city.toLowerCase().trim();
  const district = params.district ? params.district.toLowerCase().trim() : undefined;
  const cacheKey = `rapidapi:duty:${city}:${district || "all"}`;

  const cached = getCache<any>(cacheKey);
  if (cached) {
    return { ...cached, wasCacheHit: true };
  }

  let url = `https://${RAPIDAPI_HOST}/pharmacies-on-duty?city=${encodeURIComponent(city)}`;
  if (district && district !== "tumu" && district !== "all") {
    url += `&district=${encodeURIComponent(district)}`;
  }

  const key = getApiKey();

  try {
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsed = {};
      try { parsed = JSON.parse(errText); } catch {}
      throw {
        status: res.status,
        message: (parsed as any).message || `RapidAPI Hatası: ${res.statusText}`,
      };
    }

    const data = await res.json();
    setCache(cacheKey, data);
    return { ...data, wasCacheHit: false };
  } catch (err: any) {
    console.error("RapidAPI duty error:", err);
    throw err;
  }
}

/**
 * 3. GET /pharmacies-on-duty/locations
 */
export async function getRapidApiLocations(params: { latitude: number; longitude: number }) {
  const latRounded = Number(params.latitude).toFixed(3);
  const lngRounded = Number(params.longitude).toFixed(3);
  const cacheKey = `rapidapi:locations:${latRounded}_${lngRounded}`;

  const cached = getCache<any>(cacheKey);
  if (cached) {
    return { ...cached, wasCacheHit: true };
  }

  const url = `https://${RAPIDAPI_HOST}/pharmacies-on-duty/locations?latitude=${encodeURIComponent(params.latitude)}&longitude=${encodeURIComponent(params.longitude)}`;
  const key = getApiKey();

  try {
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsed = {};
      try { parsed = JSON.parse(errText); } catch {}
      throw {
        status: res.status,
        message: (parsed as any).message || `RapidAPI Hatası: ${res.statusText}`,
      };
    }

    const data = await res.json();
    setCache(cacheKey, data);
    return { ...data, wasCacheHit: false };
  } catch (err: any) {
    console.error("RapidAPI locations error:", err);
    throw err;
  }
}
