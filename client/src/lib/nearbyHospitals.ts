import type { HealthFacility } from "./healthFacilityData";

type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const cache = new Map<string, { until: number; facilities: HealthFacility[] }>();

export async function getNearbyHospitals(latitude: number, longitude: number, signal?: AbortSignal): Promise<HealthFacility[]> {
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached && cached.until > Date.now()) return cached.facilities;

  const query = `[out:json][timeout:10];nwr["amenity"="hospital"]["name"](around:12000,${latitude},${longitude});out center 60;`;
  let data: any;
  for (const endpoint of [
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  ]) {
    if (signal?.aborted) throw new Error("İstek iptal edildi");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }),
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000),
      });
      if (!response.ok) continue;
      const candidate = await response.json();
      if (Array.isArray(candidate.elements)) { data = candidate; break; }
    } catch { /* Try the next public map server. */ }
  }
  if (!data) throw new Error("Harita servislerine erişilemedi");
  if (!Array.isArray(data.elements)) throw new Error("Harita yanıtı geçersiz");
  const facilities: HealthFacility[] = data.elements.flatMap((item: OsmElement) => {
    const lat = item.lat ?? item.center?.lat;
    const lon = item.lon ?? item.center?.lon;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !item.tags?.name) return [];
    const tags = item.tags;
    const address = [tags["addr:street"], tags["addr:housenumber"], tags["addr:suburb"]].filter(Boolean).join(" ");
    return [{
      id: `osm-${item.type}-${item.id}`,
      name: tags["name:tr"] || tags.name,
      type: "hastane" as const,
      typeName: "Hastane · OpenStreetMap",
      city: tags["addr:city"] || "",
      district: tags["addr:district"] || "",
      address: address || "Adres harita kaydında belirtilmemiş",
      landmark: "",
      phone: tags.phone || tags["contact:phone"] || "",
      is24Hours: tags.opening_hours === "24/7",
      services: [],
      location: { latitude: lat!, longitude: lon! },
    }];
  });
  cache.set(key, { until: Date.now() + 10 * 60 * 1000, facilities });
  return facilities;
}
