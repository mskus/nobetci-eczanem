import { getCache, setCache } from "./cacheService.js";

const BASE_URL = "https://eczaneadresi.com/api/public/v1";
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export interface EczaneAdresiPharmacy {
  id: number | string;
  name: string;
  slug: string;
  url?: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  lat?: number | null;
  lng?: number | null;
  distance_m?: number;
  mapsUrl?: string;
  duty?: {
    date: string;
    isVerified: boolean;
  };
}

/**
 * 1. GET /duty-pharmacies
 * Belirli ilde (ve opsiyonel ilcede) bugunun nobetci eczaneleri.
 */
export async function getEczaneAdresiDutyPharmacies(params: {
  city: string;
  district?: string;
  limit?: number;
}) {
  const citySlug = params.city.toLowerCase().trim();
  const districtSlug = params.district ? params.district.toLowerCase().trim() : undefined;
  const limit = params.limit || 50;

  const cacheKey = `ea:duty:${citySlug}:${districtSlug || "all"}:${limit}`;
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return { ...cached, wasCacheHit: true };
  }

  let url = `${BASE_URL}/duty-pharmacies?city=${encodeURIComponent(citySlug)}&limit=${limit}`;
  if (districtSlug && districtSlug !== "tumu" && districtSlug !== "all") {
    url += `&district=${encodeURIComponent(districtSlug)}`;
  }

  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`HTTP_${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    setCache(cacheKey, data);
    return { ...data, wasCacheHit: false };
  } catch (err: any) {
    console.error("EczaneAdresi duty-pharmacies error:", err);
    throw err;
  }
}

/**
 * 2. GET /nearest-pharmacies
 * GPS koordinatina en yakin nobetci eczaneler.
 */
export async function getEczaneAdresiNearestPharmacies(params: {
  lat: number;
  lng: number;
  limit?: number;
}) {
  const latRounded = Number(params.lat).toFixed(3);
  const lngRounded = Number(params.lng).toFixed(3);
  const limit = params.limit || 10;

  const cacheKey = `ea:nearest:${latRounded}_${lngRounded}_${limit}`;
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return { ...cached, wasCacheHit: true };
  }

  const url = `${BASE_URL}/nearest-pharmacies?lat=${encodeURIComponent(params.lat)}&lng=${encodeURIComponent(params.lng)}&limit=${limit}`;

  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`HTTP_${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    setCache(cacheKey, data);
    return { ...data, wasCacheHit: false };
  } catch (err: any) {
    console.error("EczaneAdresi nearest-pharmacies error:", err);
    throw err;
  }
}

/**
 * 3. GET /iller
 * Tum il ve ilce slug+isim listesi.
 */
export async function getEczaneAdresiIller() {
  const cacheKey = "ea:iller";
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return { ...cached, wasCacheHit: true };
  }

  const url = `${BASE_URL}/iller`;

  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`HTTP_${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    setCache(cacheKey, data);
    return { ...data, wasCacheHit: false };
  } catch (err: any) {
    console.error("EczaneAdresi iller error:", err);
    throw err;
  }
}

/**
 * 4. GET /eczane/{slug}
 * Tek bir eczanenin detay sayfasi (adres, telefon, koordinat, nobet).
 */
export async function getEczaneAdresiDetail(slug: string) {
  const cacheKey = `ea:eczane:${slug}`;
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return { ...cached, wasCacheHit: true };
  }

  const url = `${BASE_URL}/eczane/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`HTTP_${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    setCache(cacheKey, data);
    return { ...data, wasCacheHit: false };
  } catch (err: any) {
    console.error("EczaneAdresi detail error:", err);
    throw err;
  }
}
