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
  LocateFixed,
} from "lucide-react";
import { toast } from "sonner";
import { AdRail, MobileAd, SectionHeading } from "@/components/SiteLayout";
import { RealLeafletMap } from "@/components/RealLeafletMap";
import { useQuota } from "@/hooks/useQuota";
import { toTurkishSlug } from "@shared/turkeyDistricts";
import { formatDistance, calculateDistanceKm } from "@/lib/turkeyGeoData";
import {
  getLocalCities,
  getLocalDistricts,
  fetchDutyPharmaciesAuto,
  fetchNearbyPharmaciesAuto,
  type RawPharmacy,
  type DayDutyGroup,
} from "@/lib/pharmacyService";

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

function FormattedAddress({
  address,
  district,
  city,
}: {
  address: string;
  district?: string;
  city?: string;
}) {
  const raw = address || "";

  // Extract landmark / tarif in parentheses like "(Devlet Hastanesi Acil Karşısı)"
  const landmarkMatch = raw.match(/\(([^)]+)\)/);
  const landmark = landmarkMatch ? landmarkMatch[1] : null;
  const withoutLandmark = raw.replace(/\([^)]+\)/, "").trim();

  // Split by comma
  const rawParts = withoutLandmark.split(",").map((s) => s.trim()).filter(Boolean);

  let mahalle = "";
  let caddeSokak = "";
  let remaining = "";

  rawParts.forEach((part) => {
    if (/mah/i.test(part) && !mahalle) {
      mahalle = part;
    } else if (/cad|sok|bulv|meydan|yol|site|apt|no/i.test(part) && !caddeSokak) {
      caddeSokak = part;
    } else if (
      !part.toLowerCase().includes(city?.toLowerCase() || "___") &&
      !part.toLowerCase().includes(district?.toLowerCase() || "___")
    ) {
      remaining = remaining ? `${remaining}, ${part}` : part;
    }
  });

  return (
    <div className="space-y-1.5 text-left">
      {mahalle ? (
        <div className="flex items-start gap-1.5">
          <MapPin size={15} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-gray-900 leading-snug">{mahalle}</p>
            {caddeSokak && (
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                {caddeSokak} {remaining ? `· ${remaining}` : ""}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-1.5">
          <MapPin size={15} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-gray-800 leading-snug">
            {raw || `${district || ""} ${city || ""}`}
          </p>
        </div>
      )}

      {landmark && (
        <div className="pl-5 pt-0.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50/90 border border-amber-200/90 px-2 py-0.5 rounded-md">
            Tarif: {landmark}
          </span>
        </div>
      )}
    </div>
  );
}

function InlineListAd({ index }: { index: number }) {
  const adContents = [
    {
      title: "Acil Sağlık ve İlaç Danışma Hattı (ALO 184 SABİM)",
      subtitle: "Nöbetçi eczanelerde aradığınız ilacı bulamadığınızda resmi sağlık danışma hattından 7/24 destek alabilirsiniz.",
      tag: "SAĞLIK REHBERİ",
      cta: "ALO 184 Bilgi",
      link: "tel:184",
    },
    {
      title: "e-Reçete ve Raporlu İlaç Temini Hatırlatması",
      subtitle: "Nöbetçi eczanelerden e-reçete numaranız ve T.C. kimlik kartınız ile raporlu veya reçeteli ilaçlarınızı temin edebilirsiniz.",
      tag: "ÖNEMLİ BİLGİ",
      cta: "Reçete Sorgula",
      link: "https://enabiz.gov.tr",
    },
    {
      title: "7/24 Açık Nöbetçi Eczane ve İlk Yardım Noktaları",
      subtitle: "Gece saatlerinde acil ilaç ihtiyaçlarınız için nöbetçi eczaneler sabah 09:00'a kadar kesintisiz hizmet vermektedir.",
      tag: "KAMU DUYURUSU",
      cta: "En Yakın Acil Servisler",
      link: "#nasil-calisir",
    },
  ];

  const ad = adContents[(index - 1) % adContents.length];

  return (
    <aside
      className="w-full my-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50/90 via-amber-50/70 to-red-50/80 border border-red-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      aria-label="Sponsorlu duyuru ve sağlık rehberi"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs font-black text-sm">
          +
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100/90 px-2 py-0.5 rounded">
              {ad.tag}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Sponsorlu Bilgilendirme</span>
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">
            {ad.title}
          </h4>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
            {ad.subtitle}
          </p>
        </div>
      </div>
      <a
        href={ad.link}
        target={ad.link.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        className="shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold text-red-700 bg-white border border-red-300 hover:bg-red-600 hover:text-white transition-all shadow-2xs whitespace-nowrap self-stretch sm:self-center text-center"
      >
        {ad.cta} →
      </a>
    </aside>
  );
}

function PharmacyCard({
  pharmacy,
  index,
  selected,
  onSelect,
  userLocation,
}: {
  pharmacy: RawPharmacy;
  index: number;
  selected: boolean;
  onSelect: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
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

  const currentDistance = useMemo(() => {
    if (pharmacy.distance !== undefined) return pharmacy.distance;
    if (userLocation && pharmacy.location?.latitude && pharmacy.location?.longitude) {
      return calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        pharmacy.location.latitude,
        pharmacy.location.longitude
      );
    }
    return undefined;
  }, [pharmacy.distance, pharmacy.location, userLocation]);

  return (
    <article
      className={`h-full flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
        selected
          ? "border-red-600 ring-2 ring-red-500 shadow-md transform -translate-y-0.5"
          : "border-gray-200 hover:border-red-300 hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      {/* Top Header Section with Name, Area, and Automatic Distance */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-green-700 flex items-center gap-1.5 mb-1">
              <span className="live-dot shrink-0" />
              {pharmacy.duty?.isVerified ? "DOĞRULANMIŞ NÖBETÇİ" : "ŞU ANDA NÖBETÇİ"}
            </p>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 truncate leading-tight">
              {pharmacy.name}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              {pharmacy.district?.name ? `${pharmacy.district.name} · ` : ""}
              {pharmacy.city?.name || ""}
            </p>
          </div>

          {/* Automatic distance badge - Always visible based on live GPS or selected city */}
          {currentDistance !== undefined && (
            <span
              className="shrink-0 font-extrabold bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs inline-flex items-center gap-1 shadow-2xs whitespace-nowrap"
              title={
                userLocation
                  ? "Canlı konumunuza olan yaklaşık mesafe"
                  : `${pharmacy.city?.name || "İl"} merkezine olan yaklaşık mesafe`
              }
            >
              <MapPin size={13} className="text-red-600 shrink-0" />
              {formatDistance(currentDistance)}
            </span>
          )}
        </div>

        {/* Middle Address Details - Formatted with Clear Mahalle / Cadde / Tarif separation */}
        <div className="my-3 py-3 border-y border-gray-100 flex-1">
          {isAddressRejected ? (
            <div className="flex items-start gap-2 text-xs bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Adres teyit bekliyor:</strong> Resmi kaynak güvenlik sebebiyle adresi doğrulamamıştır. Lütfen gitmeden önce eczaneyi arayınız.
              </div>
            </div>
          ) : (
            <FormattedAddress
              address={pharmacy.address || ""}
              district={pharmacy.district?.name}
              city={pharmacy.city?.name}
            />
          )}
        </div>
      </div>

      {/* Action Buttons Pinned at the Bottom for Uniform Alignment */}
      <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
        <a
          className="button button-secondary flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm py-2 px-3 rounded-xl"
          href={`tel:${cleanPhone}`}
          onClick={(event) => event.stopPropagation()}
        >
          <Phone size={15} /> {pharmacy.phone || "Telefon Et"}
        </a>
        <a
          className="button button-quiet flex items-center justify-center gap-1.5 font-semibold text-xs sm:text-sm py-2 px-3 rounded-xl text-red-700 bg-red-50/80 hover:bg-red-100/80"
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          <Navigation size={15} /> Yol Tarifi
        </a>
      </div>
    </article>
  );
}

export default function Home() {
  const [cityList] = useState<Array<{ name: string; slug: string }>>(() => getLocalCities());
  const [districtList, setDistrictList] = useState<string[]>(() => getLocalDistricts("İstanbul"));
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("Tümü");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [daysData, setDaysData] = useState<DayDutyGroup[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(0);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationNote, setLocationNote] = useState("Konumunuz paylaşılmadan arama yapılmaz.");
  const [lastWasCache, setLastWasCache] = useState<boolean | undefined>(undefined);
  const [sourceNote, setSourceNote] = useState<string>("");

  const { updateQuota } = useQuota();

  // Try silent GPS retrieval on mount if permission already granted
  useEffect(() => {
    if (navigator.geolocation && navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" as any }).then((result) => {
        if (result.state === "granted") {
          navigator.geolocation.getCurrentPosition((pos) => {
            setUserLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          });
        }
      }).catch(() => {});
    }
  }, []);

  // District list automatically syncs when city changes (instant, 0 network, no <!DOCTYPE error)
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const newDistricts = getLocalDistricts(newCity);
    setDistrictList(newDistricts);
    setDistrict("Tümü");
    fetchPharmacies(newCity, "Tümü", userLocation);
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    fetchPharmacies(city, newDistrict, userLocation);
  };

  // Automated Multi-Source Pool & Fallback Fetcher
  const fetchPharmacies = async (
    targetCity: string,
    targetDistrict?: string,
    locOverride?: { latitude: number; longitude: number } | null
  ) => {
    setLoading(true);
    const activeLoc = locOverride !== undefined ? locOverride : userLocation;
    try {
      const result = await fetchDutyPharmaciesAuto(targetCity, targetDistrict, activeLoc);
      if (result.success && result.days.length > 0) {
        setDaysData(result.days);
        setSourceNote(result.sourceName);
        setLastWasCache(result.wasCacheHit);
        const todayIdx = result.days.findIndex((d) => d.day === "Bugün");
        setSelectedDayIndex(todayIdx !== -1 ? todayIdx : 0);
        setSelectedPharmacy(0);
        toast.success(`${targetCity} nöbetçi eczaneleri güncellendi`);
      } else {
        setDaysData([]);
        toast.error("Nöbetçi eczane bulunamadı.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Eczaneler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchPharmacies("İstanbul", "Tümü");
  }, []);

  // Request GPS and calculate distances
  const requestLocationAndCalculate = () => {
    if (!navigator.geolocation) {
      toast.error("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserLocation(loc);
        toast.success("Konumunuz tespit edildi, mesafeler güncellendi.");
        fetchPharmacies(city, district, loc);
      },
      () => {
        toast.error("Konum izni alınamadı. Tarayıcı ayarlarından konumu açabilirsiniz.");
      },
      { timeout: 8000 }
    );
  };

  // GPS Nearby with automatic multi-source fallback
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
        const loc = { latitude, longitude };
        setUserLocation(loc);
        setLocationNote(`Konumunuz tespit edildi (${latitude.toFixed(3)}, ${longitude.toFixed(3)}). En yakın nöbetçiler getiriliyor.`);

        try {
          const result = await fetchNearbyPharmaciesAuto(latitude, longitude);
          if (result.success && result.days.length > 0) {
            setDaysData(result.days);
            setSourceNote(result.sourceName);
            setLastWasCache(result.wasCacheHit);
            setSelectedDayIndex(0);
            setSelectedPharmacy(0);
            const count = result.days[0]?.pharmacies?.length || 0;
            toast.success(`${count} adet nöbetçi eczane mesafelerine göre sıralandı!`);
            document.getElementById("sonuclar")?.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            toast.error("Yakınınızda eczane bulunamadı");
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

            {/* Otomatik Canlı Harita - Gerçek Koordinatlarla */}
            <div className="w-full my-4 rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-white">
              <RealLeafletMap
                pharmacies={activePharmacies}
                selectedPharmacy={selectedPharmacy}
                userLocation={userLocation}
                onSelect={(idx) => {
                  setSelectedPharmacy(idx);
                  const el = document.getElementById(`pharmacy-card-${idx}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                areaTitle={`${city} ${district !== "Tümü" ? district : ""}`}
              />
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
          {/* Results Header with Day Tabs on Top Right */}
          <div className="results-heading flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow uppercase font-bold tracking-wider text-red-600">
                  {city} {district !== "Tümü" ? `· ${district}` : "· TÜM İLÇELER"}
                </p>
                {sourceNote && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {sourceNote}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                Nöbetçi Eczaneler
              </h2>
              {activeDayGroup && (
                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                  {activeDayGroup.day === "Dün"
                    ? "Dünkü nöbet listesi arşivi"
                    : activeDayGroup.day === "Bugün"
                    ? "Aktif nöbet dönemi (Sabah 09:00'a kadar geçerli)"
                    : "Gelecek gün nöbet çizelgesi"}
                </p>
              )}
            </div>

            {/* Dün / Bugün / Yarın Buttons placed directly at top-right of the list */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200 self-start md:self-auto shadow-2xs">
              {daysData.map((dGroup, idx) => {
                const isSelected = selectedDayIndex === idx;
                return (
                  <button
                    key={dGroup.day || idx}
                    type="button"
                    onClick={() => {
                      setSelectedDayIndex(idx);
                      setSelectedPharmacy(0);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? "bg-red-600 text-white shadow-xs"
                        : "text-gray-700 hover:text-gray-950 hover:bg-white/80"
                    }`}
                  >
                    <span>{dGroup.day}</span>
                    {dGroup.date && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isSelected ? "bg-red-700 text-white" : "text-gray-500"
                        }`}
                      >
                        {dGroup.date.slice(5).replace("-", "/")}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isSelected ? "bg-white text-red-600" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {dGroup.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results layout */}
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 size={42} className="animate-spin text-red-600 mx-auto" />
              <p className="text-base font-bold text-gray-700">Nöbetçi eczaneler alınıyor...</p>
              <p className="text-xs text-gray-400">Akıllı önbellek ve resmi kaynaklar kontrol ediliyor</p>
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
            <div className="pharmacy-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch mt-4">
              {activePharmacies.map((pharmacy, index) => (
                <div key={pharmacy.id || pharmacy.name + index} className="contents">
                  <div id={`pharmacy-card-${index}`} className="h-full">
                    <PharmacyCard
                      pharmacy={pharmacy}
                      index={index}
                      selected={index === selectedPharmacy}
                      onSelect={() => setSelectedPharmacy(index)}
                      userLocation={userLocation}
                    />
                  </div>
                  {/* Reklam: 4 eczanede bir araya sponsorlu duyuru/reklam kutusu eklenir */}
                  {(index + 1) % 4 === 0 && (
                    <div className="col-span-full">
                      <InlineListAd index={Math.floor((index + 1) / 4)} />
                    </div>
                  )}
                </div>
              ))}
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
