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

  const query = `[out:json][timeout:12];nwr["amenity"="hospital"]["name"](around:15000,${latitude},${longitude});out center 80;`;
  const endpoints = [
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  ];
  const requestController = new AbortController();
  const requestSignal = signal
    ? AbortSignal.any([signal, requestController.signal, AbortSignal.timeout(12000)])
    : AbortSignal.any([requestController.signal, AbortSignal.timeout(12000)]);

  try {
    const data = await Promise.any(endpoints.map(async (endpoint) => {
      // GET keeps this a simple cross-origin request and avoids browser preflight
      // failures on public Overpass mirrors.
      const response = await fetch(`${endpoint}?${new URLSearchParams({ data: query })}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: requestSignal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const candidate = await response.json();
      if (!Array.isArray(candidate.elements)) throw new Error("Harita yanıtı geçersiz");
      return candidate;
    }));
    requestController.abort();
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
  } catch {
    requestController.abort();
    throw new Error("Harita servislerine erişilemedi");
  }
}
