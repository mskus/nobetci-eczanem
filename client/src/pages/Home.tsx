import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Check,
  Clock3,
  Cross,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { AdRail, MobileAd, SectionHeading } from "@/components/SiteLayout";
import { useQuota } from "@/hooks/useQuota";
import { toTurkishSlug } from "@shared/turkeyDistricts";

export interface PharmacyLocation {
  latitude: number | null;
  longitude: number | null;
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
  phone: string;
  phone2?: string | null;
  location?: PharmacyLocation;
  city?: { name: string; slug: string };
  district?: { name: string; slug: string };
  duty?: { date: string; isVerified: boolean };
  dataQuality?: PharmacyDataQuality;
  distance?: number;
}

export interface DayDutyGroup {
  day?: string; // "Dün", "Bugün", "Yarın"
  date: string;
  count: number;
  pharmacies: RawPharmacy[];
}

function MapPreview({
  pharmacies,
  activePharmacy,
  onSelect,
  areaTitle,
}: {
  pharmacies: RawPharmacy[];
  activePharmacy: number;
  onSelect: (index: number) => void;
  areaTitle: string;
}) {
  // Compute normalized coordinates for SVG / Canvas map markers
  const markers = useMemo(() => {
    const valid = pharmacies.filter(
      (p) => p.location && p.location.latitude && p.location.longitude
    );

    if (valid.length === 0) {
      return pharmacies.map((p, i) => ({
        pharmacy: p,
        index: i,
        x: `${30 + ((i * 18) % 50)}%`,
        y: `${35 + ((i * 22) % 45)}%`,
      }));
    }

    const lats = valid.map((p) => p.location!.latitude!);
    const lngs = valid.map((p) => p.location!.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = maxLat - minLat || 0.01;
    const lngSpan = maxLng - minLng || 0.01;

    return pharmacies.map((p, i) => {
      if (p.location?.latitude && p.location?.longitude) {
        // Latitude increases northward (inverted for top %: higher lat = lower top %)
        const normY = 15 + (1 - (p.location.latitude - minLat) / latSpan) * 70;
        const normX = 15 + ((p.location.longitude - minLng) / lngSpan) * 70;
        return {
          pharmacy: p,
          index: i,
          x: `${Math.max(8, Math.min(92, normX))}%`,
          y: `${Math.max(12, Math.min(88, normY))}%`,
        };
      }
      return {
        pharmacy: p,
        index: i,
        x: `${40 + ((i * 12) % 35)}%`,
        y: `${45 + ((i * 15) % 35)}%`,
      };
    });
  }, [pharmacies]);

  const activePharm = pharmacies[activePharmacy];

  return (
    <div className="map-preview" aria-label="Nöbetçi eczane harita görünümü">
      <div className="map-topbar">
        <span className="map-title">
          <MapPin size={18} /> {areaTitle}
        </span>
        <span className="map-status">
          <span className="status-dot" /> {pharmacies.length} nöbetçi
        </span>
      </div>
      <div className="map-canvas relative overflow-hidden">
        <div className="map-grid" aria-hidden="true" />
        <div className="map-river" aria-hidden="true" />

        {markers.map(({ pharmacy, index, x, y }) => {
          const isSelected = index === activePharmacy;
          return (
            <div
              key={pharmacy.id || pharmacy.name + index}
              className={`map-marker cursor-pointer transition-transform hover:scale-125 ${
                isSelected ? "selected shadow-lg z-20 scale-110" : "z-10"
              }`}
              style={{ left: x, top: y }}
              onClick={() => onSelect(index)}
              title={`${pharmacy.name} (${pharmacy.district?.name || ""})`}
            >
              <Cross size={18} strokeWidth={3} />
            </div>
          );
        })}

        {/* Selected pharmacy popup overlay on map */}
        {activePharm && (
          <div className="absolute bottom-12 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-lg border border-gray-200 z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Seçili Eczane</p>
                <h4 className="text-sm font-extrabold text-gray-900 leading-tight">{activePharm.name}</h4>
                <p className="text-xs text-gray-500 truncate">{activePharm.address || activePharm.district?.name || "Adres bilgisi teyit edilmeli"}</p>
              </div>
              <a
                href={
                  activePharm.location?.latitude && activePharm.location?.longitude
                    ? `https://www.google.com/maps/dir/?api=1&destination=${activePharm.location.latitude},${activePharm.location.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        activePharm.name + " " + (activePharm.district?.name || "") + " " + (activePharm.city?.name || "")
                      )}`
                }
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shrink-0 shadow-xs"
                title="Google Haritalar ile Yol Tarifi Al"
              >
                <Navigation size={14} />
              </a>
            </div>
          </div>
        )}

        <div className="map-legend">
          <span className="legend-marker">
            <Cross size={12} strokeWidth={3} />
          </span>{" "}
          Canlı Nöbetçi
        </div>
      </div>
    </div>
  );
}

function PharmacyCard({
  pharmacy,
  index,
  selected,
  onSelect,
}: {
  pharmacy: RawPharmacy;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const isAddressRejected =
    !pharmacy.address ||
    pharmacy.dataQuality?.status === "rejected" ||
    pharmacy.address.trim() === "";

  const cleanPhone = pharmacy.phone.replace(/[^0-9+]/g, "");

  const mapsUrl =
    pharmacy.location?.latitude && pharmacy.location?.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.latitude},${pharmacy.location.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          pharmacy.name +
            " Eczanesi " +
            (pharmacy.district?.name || "") +
            " " +
            (pharmacy.city?.name || "")
        )}`;

  return (
    <article
      className={`pharmacy-card transition-all ${
        selected ? "selected ring-2 ring-red-500 shadow-md" : "hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      <div className="pharmacy-card-top">
        <div>
          <p className="pharmacy-kicker">
            <span className="live-dot" /> {pharmacy.duty?.isVerified ? "DOĞRULANMIŞ NÖBETÇİ" : "ŞU ANDA NÖBETÇİ"}
          </p>
          <h3 className="text-xl font-extrabold text-gray-900">{pharmacy.name}</h3>
          <p className="pharmacy-area font-medium text-gray-600">
            {pharmacy.district?.name ? `${pharmacy.district.name} · ` : ""}
            {pharmacy.city?.name || ""}
          </p>
        </div>
        {pharmacy.distance !== undefined && (
          <span className="distance-badge font-bold bg-red-50 text-red-700 border border-red-200">
            {pharmacy.distance < 1
              ? `${Math.round(pharmacy.distance * 1000)} m`
              : `${pharmacy.distance.toFixed(1)} km`}
          </span>
        )}
      </div>

      <div className="pharmacy-details space-y-2">
        {isAddressRejected ? (
          <div className="flex items-start gap-2 text-xs bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Adres teyit bekliyor:</strong> Resmi kaynak güvenlik sebebiyle adresi doğrulamamıştır. Lütfen
              gitmeden önce eczaneyi telefonla arayınız.
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            <MapPin size={18} className="text-red-500 shrink-0 inline" /> {pharmacy.address}
          </p>
        )}
        <p className="text-xs text-gray-500 font-medium">
          <Clock3 size={16} className="inline text-gray-400 mr-1" /> Nöbet ertesi sabah 09:00'a kadar geçerlidir
        </p>
      </div>

      <div className="pharmacy-actions">
        <a
          className="button button-secondary flex items-center justify-center gap-2 font-bold"
          href={`tel:${cleanPhone}`}
          onClick={(event) => event.stopPropagation()}
        >
          <Phone size={18} /> {pharmacy.phone || "Telefon Et"}
        </a>
        <a
          className="button button-quiet flex items-center justify-center gap-2 font-semibold"
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          <Navigation size={18} /> Yol Tarifi
        </a>
      </div>
    </article>
  );
}

export default function Home() {
  const [cityList, setCityList] = useState<Array<{ name: string; slug: string }>>([]);
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("Tümü");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Data source selection: "eczaneapi" (primary, quota-managed), "eczaneadresi" (public v1), "rapidapi" (alternative)
  const [dataSource, setDataSource] = useState<"eczaneapi" | "eczaneadresi" | "rapidapi">("eczaneapi");

  const [loading, setLoading] = useState(false);
  const [daysData, setDaysData] = useState<DayDutyGroup[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(0);
  const [locationNote, setLocationNote] = useState("Konumunuz paylaşılmadan arama yapılmaz.");
  const [lastWasCache, setLastWasCache] = useState<boolean | undefined>(undefined);
  const [sourceNote, setSourceNote] = useState<string>("");

  const { updateQuota } = useQuota();

  // 1. Load 82 static cities (0 API quota cost)
  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch("/api/cities");
        const json = await res.json();
        if (json.success && json.data) {
          setCityList(json.data);
        }
      } catch (err) {
        console.error("Cities load error:", err);
      }
    }
    loadCities();
  }, []);

  // 2. Load districts whenever city changes (0 API quota cost)
  useEffect(() => {
    async function loadDistricts() {
      const slug = toTurkishSlug(city);
      try {
        const res = await fetch(`/api/cities/${slug}/districts`);
        const json = await res.json();
        if (json.success && json.districts) {
          setDistrictList(json.districts);
        } else {
          setDistrictList([]);
        }
      } catch (err) {
        setDistrictList([]);
      }
    }
    loadDistricts();
    setDistrict("Tümü");
  }, [city]);

  // 3. Fetch pharmacies function supporting multiple data sources
  const fetchPharmacies = async (
    targetCity: string,
    targetDistrict?: string,
    overrideSource?: "eczaneapi" | "eczaneadresi" | "rapidapi"
  ) => {
    setLoading(true);
    const activeSource = overrideSource || dataSource;
    const citySlug = toTurkishSlug(targetCity);
    const districtParam =
      targetDistrict && targetDistrict !== "Tümü"
        ? `&district=${encodeURIComponent(targetDistrict)}`
        : "";

    try {
      if (activeSource === "eczaneapi") {
        const res = await fetch(`/api/pharmacies/on-duty?city=${citySlug}${districtParam}`);
        const json = await res.json();

        if (json.success && json.data) {
          setDaysData(json.data.days || []);
          setLastWasCache(json.wasCacheHit);
          setSourceNote("EczaneAPI (Resmi İl Sağlık / Eczacı Odaları)");

          if (json.quota) {
            updateQuota(json.quota);
          }

          const todayIdx = (json.data.days || []).findIndex(
            (d: DayDutyGroup) => d.day === "Bugün"
          );
          setSelectedDayIndex(todayIdx !== -1 ? todayIdx : 0);
          setSelectedPharmacy(0);

          if (json.wasCacheHit) {
            toast.success("Akıllı önbellekten 0 kotayla yüklendi ⚡");
          } else {
            toast.success("EczaneAPI: Güncel nöbetçi eczaneler listelendi");
          }
        } else {
          toast.error(json.error || "Eczane listesi alınamadı");
        }
      } else if (activeSource === "eczaneadresi") {
        // eczaneadresi.com public v1
        const res = await fetch(
          `/api/eczaneadresi/duty-pharmacies?city=${citySlug}${targetDistrict && targetDistrict !== "Tümü" ? `&district=${encodeURIComponent(toTurkishSlug(targetDistrict))}` : ""}&limit=50`
        );
        const json = await res.json();

        if (json.success) {
          const list: any[] = json.data || (Array.isArray(json) ? json : []);
          const mapped: RawPharmacy[] = list.map((item: any, i: number) => ({
            id: String(item.id || item.slug || i),
            name: item.name || item.eczane_adi || "Eczane",
            address: item.address || item.adres || "Adres bilgisi mevcut",
            phone: item.phone || item.telefon || "",
            phone2: item.phone2 || null,
            location: {
              latitude: item.lat || item.latitude || (item.location ? item.location.lat : null),
              longitude: item.lng || item.longitude || (item.location ? item.location.lng : null),
            },
            city: { name: targetCity, slug: citySlug },
            district: {
              name: item.district || targetDistrict || "",
              slug: toTurkishSlug(item.district || targetDistrict || ""),
            },
            duty: {
              date: new Date().toISOString().split("T")[0],
              isVerified: true,
            },
            distance: item.distance_m ? item.distance_m / 1000 : undefined,
          }));

          setDaysData([
            {
              day: "Bugün (EczaneAdresi.com)",
              date: new Date().toISOString().split("T")[0],
              count: mapped.length,
              pharmacies: mapped,
            },
          ]);
          setLastWasCache(json.wasCacheHit);
          setSourceNote("EczaneAdresi.com Public API v1");
          setSelectedDayIndex(0);
          setSelectedPharmacy(0);
          toast.success(`EczaneAdresi.com: ${mapped.length} eczane listelendi`);
        } else {
          toast.error(json.error || "EczaneAdresi verisi alınamadı");
        }
      } else if (activeSource === "rapidapi") {
        // RapidAPI pharmacies-on-duty
        const res = await fetch(
          `/api/rapidapi/pharmacies-on-duty?city=${citySlug}${targetDistrict && targetDistrict !== "Tümü" ? `&district=${encodeURIComponent(toTurkishSlug(targetDistrict))}` : ""}`
        );
        const json = await res.json();

        if (json.success || Array.isArray(json.data) || Array.isArray(json)) {
          const list: any[] = json.data || (Array.isArray(json) ? json : []);
          const mapped: RawPharmacy[] = list.map((item: any, i: number) => ({
            id: String(item.id || item.name || i),
            name: item.name || item.pharmacyName || "Eczane",
            address: item.address || item.addressDescription || "Adres belirtilmemiş",
            phone: item.phone || item.phoneNumber || "",
            location: {
              latitude: item.latitude || item.lat || null,
              longitude: item.longitude || item.lon || null,
            },
            city: { name: targetCity, slug: citySlug },
            district: {
              name: item.district || targetDistrict || "",
              slug: toTurkishSlug(item.district || targetDistrict || ""),
            },
            duty: {
              date: new Date().toISOString().split("T")[0],
              isVerified: true,
            },
          }));

          setDaysData([
            {
              day: "Bugün (RapidAPI)",
              date: new Date().toISOString().split("T")[0],
              count: mapped.length,
              pharmacies: mapped,
            },
          ]);
          setLastWasCache(json.wasCacheHit);
          setSourceNote("RapidAPI Pharmacies On Duty");
          setSelectedDayIndex(0);
          setSelectedPharmacy(0);
          toast.success(`RapidAPI: ${mapped.length} eczane listelendi`);
        } else {
          toast.error(json.error || "RapidAPI verisi alınamadı");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch for default city
  useEffect(() => {
    fetchPharmacies("İstanbul", "Tümü");
  }, []);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setDistrict("Tümü");
    fetchPharmacies(newCity, "Tümü");
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    fetchPharmacies(city, newDistrict);
  };

  const handleSourceChange = (newSource: "eczaneapi" | "eczaneadresi" | "rapidapi") => {
    setDataSource(newSource);
    fetchPharmacies(city, district, newSource);
  };

  // GPS Nearby
  const findNearby = () => {
    if (!navigator.geolocation) {
      setLocationNote("Tarayıcınız konum paylaşımını desteklemiyor. Şehir ve ilçe seçebilirsiniz.");
      toast.error("Konum bilgisi desteklenmiyor");
      return;
    }

    setLocationNote("Konumunuz alınıyor...");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationNote(`Konumunuz tespit edildi (${latitude.toFixed(3)}, ${longitude.toFixed(3)}). En yakın nöbetçiler getiriliyor.`);

        try {
          if (dataSource === "eczaneadresi") {
            // EczaneAdresi nearest
            const res = await fetch(`/api/eczaneadresi/nearest-pharmacies?lat=${latitude}&lng=${longitude}&limit=10`);
            const json = await res.json();
            if (json.success) {
              const list = json.data || (Array.isArray(json) ? json : []);
              const mapped: RawPharmacy[] = list.map((item: any, i: number) => ({
                id: String(item.id || item.slug || i),
                name: item.name || item.eczane_adi || "Eczane",
                address: item.address || item.adres || "Adres",
                phone: item.phone || item.telefon || "",
                location: {
                  latitude: item.lat || null,
                  longitude: item.lng || null,
                },
                distance: item.distance_m ? item.distance_m / 1000 : undefined,
                duty: { date: new Date().toISOString().split("T")[0], isVerified: true },
              }));
              setDaysData([
                {
                  day: "Yakınınızda (EczaneAdresi.com)",
                  date: new Date().toISOString().split("T")[0],
                  count: mapped.length,
                  pharmacies: mapped,
                },
              ]);
              setLastWasCache(json.wasCacheHit);
              setSourceNote("EczaneAdresi.com GPS En Yakın Eczaneler");
              setSelectedDayIndex(0);
              setSelectedPharmacy(0);
              toast.success(`${mapped.length} adet nöbetçi eczane bulundu!`);
              document.getElementById("sonuclar")?.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }
          }

          // Default / Primary EczaneAPI
          const res = await fetch(
            `/api/pharmacies/nearby?latitude=${latitude}&longitude=${longitude}&radius=15`
          );
          const json = await res.json();

          if (json.success && json.data) {
            setLastWasCache(json.wasCacheHit);
            if (json.quota) updateQuota(json.quota);
            setSourceNote("EczaneAPI Canlı GPS Konum Servisi");

            const pharmaciesList: RawPharmacy[] = json.data.pharmacies || [];
            setDaysData([
              {
                day: "Yakınınızda Nöbetçi",
                date: json.data.date || new Date().toISOString().split("T")[0],
                count: pharmaciesList.length,
                pharmacies: pharmaciesList,
              },
            ]);
            setSelectedDayIndex(0);
            setSelectedPharmacy(0);
            toast.success(`${pharmaciesList.length} adet nöbetçi eczane bulundu!`);
            document.getElementById("sonuclar")?.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            toast.error(json.error || "Yakınınızda eczane bulunamadı");
          }
        } catch (err) {
          toast.error("Konum bazlı eczaneler getirilemedi.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setLocationNote("Konum izni verilmedi. Şehir ve ilçe seçerek listeleyebilirsiniz.");
        toast.error("Konum izni alınamadı.");
      },
      { timeout: 10000 }
    );
  };

  // Current active day's pharmacies
  const activeDayGroup = daysData[selectedDayIndex] || daysData[0];
  const activePharmacies = activeDayGroup?.pharmacies || [];

  return (
    <main>
      <section className="hero-section">
        <AdRail side="left" />
        <div className="hero-content container">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" /> BUGÜN AÇIK NÖBETÇİ ECZANELER <span className="eyebrow-line" />
          </div>
          <h1>
            En Yakın <span>Nöbetçi Eczaneyi</span> Bul
          </h1>
          <p className="hero-lead">
            Türkiye genelinde 81 il ve ilçelerde şu anda açık olan güncel nöbetçi eczaneler.
          </p>

          <div className="search-panel">
            <button
              type="button"
              className="button button-primary location-button"
              onClick={findNearby}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <MapPin size={24} fill="currentColor" />
              )}
              Yakınımdaki Eczaneleri Bul (GPS)
            </button>

            <div className="search-divider">
              <span>veya 81 il ve ilçe seçin</span>
            </div>

            {/* Kaynak Seçici / Data Source Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2 p-1.5 bg-gray-100/80 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-gray-500 mr-1">Veri Kaynağı:</span>
              <button
                type="button"
                onClick={() => handleSourceChange("eczaneapi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  dataSource === "eczaneapi"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                EczaneAPI (Resmi/200 Kota)
              </button>
              <button
                type="button"
                onClick={() => handleSourceChange("eczaneadresi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  dataSource === "eczaneadresi"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                EczaneAdresi.com (Public v1)
              </button>
              <button
                type="button"
                onClick={() => handleSourceChange("rapidapi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  dataSource === "rapidapi"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                RapidAPI (Yedek)
              </button>
            </div>

            <div className="select-row">
              <label>
                <span>İl</span>
                <select
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  aria-label="İl seçin"
                  disabled={loading}
                >
                  {cityList.length > 0 ? (
                    cityList.map((item) => (
                      <option key={item.slug} value={item.name}>
                        {item.name}
                      </option>
                    ))
                  ) : (
                    <option value="İstanbul">İstanbul</option>
                  )}
                </select>
              </label>

              <label>
                <span>İlçe</span>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  aria-label="İlçe seçin"
                  disabled={loading}
                >
                  <option value="Tümü">Tüm İlçeler ({districtList.length})</option>
                  {districtList.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="button button-outline search-button"
                onClick={() => fetchPharmacies(city, district)}
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={20} />}
                Eczaneleri Listele
              </button>
            </div>

            <p className="search-note">
              <ShieldCheck size={17} /> {locationNote}
            </p>
          </div>

          <div className="hero-trust">
            <span>
              <Check size={17} /> 81 İl ve Tüm İlçeler
            </span>
            <span>
              <Check size={17} /> Canlı EczaneAPI Altyapısı
            </span>
            <span>
              <Check size={17} /> Akıllı Kota Koruması
            </span>
          </div>
        </div>
        <AdRail side="right" />
      </section>

      <MobileAd />

      {/* Results Section */}
      <section className="results-section" id="sonuclar">
        <div className="container">
          {/* Results Header with Day Tabs & Cache Indicator */}
          <div className="results-heading flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="eyebrow uppercase font-bold tracking-wider text-red-600">
                  {city} {district !== "Tümü" ? `· ${district}` : "· TÜM İLÇELER"}
                </p>
                {sourceNote && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                    {sourceNote}
                  </span>
                )}
              </div>
              <h2>Nöbetçi Eczaneler</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Day selection tabs (Yesterday, Today, Tomorrow) from single API call */}
              {daysData.length > 1 && (
                <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                  {daysData.map((dGroup, idx) => (
                    <button
                      key={dGroup.day || idx}
                      type="button"
                      onClick={() => {
                        setSelectedDayIndex(idx);
                        setSelectedPharmacy(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedDayIndex === idx
                          ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {dGroup.day || dGroup.date} ({dGroup.count})
                    </button>
                  ))}
                </div>
              )}

              {/* Cache status badge */}
              {lastWasCache !== undefined && (
                <div
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold border ${
                    lastWasCache
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                  title="Sorgu kaynağı ve kota durumu"
                >
                  {lastWasCache ? (
                    <>
                      <Zap size={14} className="text-amber-500 fill-amber-500" />
                      Önbellekten (0 Kota Harcandı)
                    </>
                  ) : (
                    <>
                      <Activity size={14} className="text-amber-600" />
                      Canlı Sorgu (1 Kota)
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results layout */}
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 size={42} className="animate-spin text-red-600 mx-auto" />
              <p className="text-base font-bold text-gray-700">Nöbetçi eczaneler alınıyor...</p>
              <p className="text-xs text-gray-400">Akıllı önbellek kontrol ediliyor</p>
            </div>
          ) : activePharmacies.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 space-y-3">
              <Cross size={36} className="text-gray-400 mx-auto" />
              <h3 className="text-lg font-bold text-gray-800">
                Seçilen bölgede nöbetçi eczane bulunamadı
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                {city} {district !== "Tümü" ? district : ""} için nöbetçi kaydı henüz yayımlanmamış veya nöbet
                listesi güncelleniyor olabilir.
              </p>
              <button
                type="button"
                onClick={() => handleDistrictChange("Tümü")}
                className="button button-secondary text-xs inline-flex items-center gap-2 mt-2"
              >
                <Layers size={14} /> Tüm {city} İlçelerini Göster
              </button>
            </div>
          ) : (
            <div className="results-layout">
              <MapPreview
                pharmacies={activePharmacies}
                activePharmacy={selectedPharmacy}
                onSelect={(idx) => setSelectedPharmacy(idx)}
                areaTitle={`${city} ${district !== "Tümü" ? district : ""}`}
              />
              <div className="pharmacy-list space-y-4">
                {activePharmacies.map((pharmacy, index) => (
                  <PharmacyCard
                    key={pharmacy.id || pharmacy.name + index}
                    pharmacy={pharmacy}
                    index={index}
                    selected={index === selectedPharmacy}
                    onSelect={() => setSelectedPharmacy(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section" id="nasil-calisir">
        <div className="container">
          <SectionHeading
            eyebrow="ÜÇ ADIMDA"
            title="İhtiyacınız olan eczaneyi bulun"
            description="Karmaşık menüler yok. Konumunuzu paylaşın veya şehir seçin, açık eczaneyi görün ve yola çıkın."
          />
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <span className="step-icon">
                <MapPin size={26} />
              </span>
              <h3>Şehir ve İlçe Seçin</h3>
              <p>Türkiye'nin 81 ilinden dilediğinizi seçin veya tek tıkla GPS konumunuzu kullanın.</p>
            </div>
            <div className="step-card">
              <span className="step-number">02</span>
              <span className="step-icon">
                <Cross size={26} />
              </span>
              <h3>Nöbetçi Eczaneleri Görün</h3>
              <p>Sabah 09:00'a kadar kesintisiz açık eczanelerin güncel adres ve telefonlarını inceleyin.</p>
            </div>
            <div className="step-card">
              <span className="step-number">03</span>
              <span className="step-icon">
                <Navigation size={26} />
              </span>
              <h3>Tek Tıkla Yol Tarifi</h3>
              <p>Telefon edin veya doğrudan Google Haritalar ile yol tarifini anında başlatın.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Update info section */}
      <section className="update-section">
        <div className="container update-box">
          <div className="update-icon">
            <Clock3 size={26} />
          </div>
          <div>
            <p className="eyebrow">VERİ VE KOTA GÜVENLİĞİ</p>
            <h2>Nöbetçi listeleri her sabah 09:00'da yenilenir.</h2>
            <p>
              Akıllı önbellek mimarimiz sayesinde aylık 200 sorgu kotası en verimli şekilde korunur ve tüm veriler
              anlık olarak servis edilir.
            </p>
          </div>
          <Link href="/veri-kaynaklari" className="button button-quiet">
            Veri ve Kota Detayları <ArrowRight size={19} />
          </Link>
        </div>
      </section>

      {/* Closing section */}
      <section className="closing-section">
        <div className="container closing-inner">
          <div>
            <p className="eyebrow">GÜVENİLİR VE SADE</p>
            <h2>Mahallenizdeki güvenilir eczanenin dijital hali.</h2>
          </div>
          <p>Nöbetçi Eczanem, ihtiyaç anında doğru bilgiye en kısa yoldan ulaşmanız için tasarlandı.</p>
          <div className="closing-mark">
            <Sparkles size={20} /> Her gün 81 ilde yanınızda
          </div>
        </div>
      </section>
    </main>
  );
}
