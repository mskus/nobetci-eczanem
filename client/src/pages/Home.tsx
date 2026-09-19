import { useEffect, useMemo, useRef, useState } from "react";
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
  Calculator,
  Wind,
  ShieldAlert,
  Pill,
  Droplets,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";
import { AdRail, MobileAd, SectionHeading } from "@/components/SiteLayout";
import { RealLeafletMap } from "@/components/RealLeafletMap";
import { useQuota } from "@/hooks/useQuota";
import { useUserLocation } from "@/lib/globalLocation";
import { toTurkishSlug } from "@shared/turkeyDistricts";
import { formatDistance, calculateDistanceKm, findNearestCityAndDistrict, TURKEY_CITY_COORDINATES, TURKEY_DISTRICT_COORDINATES } from "@/lib/turkeyGeoData";
import {
  getLocalCities,
  getLocalDistricts,
  fetchDutyPharmaciesAuto,
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

function formatCleanPhone(phoneStr?: string | null): string {
  if (!phoneStr) return "Telefon Et";
  const digits = phoneStr.replace(/[^0-9]/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }
  return phoneStr;
}

function FormattedAddress({
  address,
  landmark: directLandmark,
  addressDescription,
  district,
  city,
}: {
  address: string;
  landmark?: string | null;
  addressDescription?: string | null;
  district?: string;
  city?: string;
}) {
  const raw = (address || "").trim();

  // Source addresses frequently place directions in parentheses.
  const parentheticalDirections = [...raw.matchAll(/\(([^)]+)\)/g)]
    .map((match) => match[1].trim()).filter(Boolean);
  const inlineDirection = raw.match(/(?:Tarif|Açıklama|Adres Tarifi|Konum Tarifi):\s*([^,]+)/i)?.[1]?.trim();
  const directions = [directLandmark, addressDescription, ...parentheticalDirections, inlineDirection]
    .map((part) => part?.trim()).filter((part): part is string => Boolean(part));
  const landmarkText = [...new Set(directions)].join(" · ");

  // 2. Clean raw address string without parentheses or tarif tags
  let cleanAddress = raw
    .replace(/\([^)]+\)/g, "")
    .replace(/(?:Tarif|Açıklama|Adres Tarifi|Konum Tarifi):\s*[^,]+/gi, "")
    .replace(/,\s*,/g, ",")
    .trim();

  if (!cleanAddress || cleanAddress.length < 6) {
    cleanAddress = "Adres bilgisi kaynaktan alınamadı; gitmeden önce eczaneyi arayın.";
  }

  // Ensure district and city suffix are clearly present
  const cityLower = (city || "").toLocaleLowerCase("tr-TR");
  const distLower = (district && district !== "Tümü" ? district : "").toLocaleLowerCase("tr-TR");
  
  let detailedFullAddress = cleanAddress;
  if (cityLower && !detailedFullAddress.startsWith("Adres bilgisi kaynaktan") && !detailedFullAddress.toLocaleLowerCase("tr-TR").includes(cityLower)) {
    detailedFullAddress += `, ${district && district !== "Tümü" ? district + " / " : ""}${city}`;
  }
  const routeDescription = landmarkText || "Konuma göre rota için aşağıdaki Yol Tarifi düğmesini kullanın.";

  return (
    <div className="space-y-2 text-left">
      {/* Full Detailed Address */}
      <div className="flex items-start gap-1.5">
        <MapPin size={15} className="text-red-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-[13px] font-bold text-gray-800 leading-snug break-words">
            {detailedFullAddress}
          </p>
        </div>
      </div>

      {/* Prominent Yellow / Amber Landmark Box */}
      <div className="pl-5 pt-0.5">
        <div className="flex items-start gap-1.5 p-1.5 px-2.5 rounded-lg bg-amber-50/95 border border-amber-300/90 text-amber-950 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/90 px-1.5 py-0.2 rounded shrink-0">
            ADRES TARİFİ
          </span>
          <p className="text-[11px] font-extrabold leading-tight flex-1 text-amber-950 break-words">
            {routeDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

function InlineListAd({ index }: { index: number }) {
  const adContents = [
    {
      title: "ALO 184 SABİM Sağlık Danışma",
      subtitle: "Aradığınız ilacı bulamadığınızda veya acil sağlık konularında Sağlık Bakanlığı ALO 184 SABİM hattından 7/24 ücretsiz bilgi alabilirsiniz.",
      tag: "SAĞLIK REHBERİ",
      cta: "ALO 184'ü Ara",
      link: "tel:184",
      highlight: "Kesintisiz 7/24 Çağrı Merkezi",
    },
    {
      title: "e-Reçete ve Raporlu İlaç Temini",
      subtitle: "Nöbetçi eczanelerden T.C. kimlik numaranız ve e-reçete kodunuz ile tüm raporlu ve reçeteli ilaçlarınızı resmi fiyatla teslim alabilirsiniz.",
      tag: "ÖNEMLİ BİLGİ",
      cta: "e-Nabız Bilgi",
      link: "https://enabiz.gov.tr",
      highlight: "Resmi SGK & e-Reçete Uyumu",
    },
    {
      title: "Gece Nöbet Saatleri (09:00'a Kadar)",
      subtitle: "Nöbetçi eczaneler akşam mesai bitiminden ertesi sabah 09:00'a kadar kesintisiz hizmet vermektedir. Ekstra nöbet ücreti alınmaz.",
      tag: "NÖBET KURALI",
      cta: "Rehberi İncele",
      link: "#sikca-sorulan-sorular",
      highlight: "Standart İlaç Fiyat Tarifesi",
    },
    {
      title: "112 Acil Çağrı & Ambulans Hizmeti",
      subtitle: "Hayati tehlike arz eden acil sağlık durumlarında vakit kaybetmeden 112 Acil Çağrı Merkezini arayınız.",
      tag: "ACİL ÇAĞRI",
      cta: "112 Acil Ara",
      link: "tel:112",
      highlight: "Ücretsiz Acil Yardım",
    },
  ];

  const ad = adContents[(index - 1) % adContents.length];

  return (
    <article
      className="h-full flex flex-col justify-between p-5 rounded-2xl border border-red-200 bg-gradient-to-b from-red-50/70 via-white to-amber-50/50 shadow-xs hover:border-red-400 hover:shadow-md transition-all text-left"
      aria-label="Sponsorlu bilgilendirme kartı"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-red-700 flex items-center gap-1.5 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              {ad.tag} · SPONSORLU BİLGİLENDİRME
            </p>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
              {ad.title}
            </h3>
            <p className="text-xs font-bold text-red-800 mt-1">
              {ad.highlight}
            </p>
          </div>
        </div>

        <div className="my-3 py-3 border-y border-red-100/80 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <p>{ad.subtitle}</p>
        </div>
      </div>

      <div className="mt-auto pt-2">
        <a
          className="button button-primary w-full flex items-center justify-center gap-2 font-black text-sm py-2.5 px-3 rounded-xl shadow-xs"
          href={ad.link}
          target={ad.link.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
        >
          {ad.cta} <ArrowRight size={16} />
        </a>
      </div>
    </article>
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

  const cleanPhone = pharmacy.phone ? pharmacy.phone.replace(/[^0-9+]/g, "") : "";
  const displayPhone = formatCleanPhone(pharmacy.phone);

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
      className={`h-full flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
        selected
          ? "border-red-600 ring-2 ring-red-500 shadow-md transform -translate-y-0.5"
          : "border-gray-200 hover:border-red-300 hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      {/* Top Header Section with Name, Area, and Automatic Distance */}
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug break-words">
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
              landmark={pharmacy.landmark}
              addressDescription={pharmacy.addressDescription}
              district={pharmacy.district?.name}
              city={pharmacy.city?.name}
            />
          )}
        </div>
      </div>

      {/* Action Buttons Pinned at the Bottom for Uniform Alignment */}
      <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
        <a
          className="button button-secondary flex items-center justify-center gap-1 font-bold text-[11px] sm:text-xs py-2 px-1.5 rounded-xl min-w-0"
          href={`tel:${cleanPhone}`}
          onClick={(event) => event.stopPropagation()}
          title={pharmacy.phone || "Telefon Et"}
        >
          <Phone size={13} className="shrink-0 text-red-600" />
          <span className="break-all leading-tight">{displayPhone || "Ara"}</span>
        </a>
        <a
          className="button button-quiet flex items-center justify-center gap-1 font-bold text-xs sm:text-[13px] py-2 px-2 rounded-xl text-red-700 bg-red-50/80 hover:bg-red-100/80 whitespace-nowrap"
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          <Navigation size={13} className="shrink-0" /> Yol Tarifi
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
  const [selectedDay, setSelectedDay] = useState<"Dün" | "Bugün" | "Yarın">("Bugün");

  const [loading, setLoading] = useState(false);
  const [daysData, setDaysData] = useState<DayDutyGroup[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(0);
  const userLocation = useUserLocation();
  const manualSelection = useRef(false);
  const latestRequest = useRef(0);
  const [locationNote, setLocationNote] = useState("Konum bilgisi alınamadı, lütfen il ve ilçe seçerek arama yapınız.");
  const [lastWasCache, setLastWasCache] = useState<boolean | undefined>(undefined);
  const [sourceNote, setSourceNote] = useState<string>("");

  const { updateQuota } = useQuota();

  // District list automatically syncs when city changes
  const handleCityChange = (newCity: string) => {
    manualSelection.current = true;
    setCity(newCity);
    const newDistricts = getLocalDistricts(newCity);
    setDistrictList(newDistricts);
    setDistrict("Tümü");
    fetchPharmacies(newCity, "Tümü", userLocation);
  };

  const handleDistrictChange = (newDistrict: string) => {
    manualSelection.current = true;
    setDistrict(newDistrict);
    fetchPharmacies(city, newDistrict, userLocation);
  };

  // Automated Multi-Source Pool & Fallback Fetcher
  const fetchPharmacies = async (
    targetCity: string,
    targetDistrict?: string,
    locOverride?: { latitude: number; longitude: number } | null
  ) => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    let activeLoc = locOverride !== undefined ? locOverride : userLocation;
    if (activeLoc && findNearestCityAndDistrict(activeLoc.latitude, activeLoc.longitude).city !== targetCity) {
      activeLoc = null;
    }
    if (!activeLoc) {
      const cSlug = toTurkishSlug(targetCity);
      const dSlug = targetDistrict && targetDistrict !== "Tümü" ? toTurkishSlug(targetDistrict) : "";
      if (dSlug && TURKEY_DISTRICT_COORDINATES[cSlug]?.[dSlug]) {
        const dCoords = TURKEY_DISTRICT_COORDINATES[cSlug][dSlug];
        activeLoc = { latitude: dCoords.lat, longitude: dCoords.lng };
      } else if (TURKEY_CITY_COORDINATES[cSlug]) {
        const cCoords = TURKEY_CITY_COORDINATES[cSlug];
        activeLoc = { latitude: cCoords.lat, longitude: cCoords.lng };
      }
    }

    try {
      const result = await fetchDutyPharmaciesAuto(targetCity, targetDistrict, activeLoc);
      if (requestId !== latestRequest.current) return;
      if (result.success && result.days.length > 0) {
        setDaysData(result.days);
        setSourceNote(result.sourceName);
        setLastWasCache(result.wasCacheHit);
        setSelectedDay("Bugün");
        setSelectedPharmacy(0);
      } else {
        setDaysData([]);
        setSourceNote(result.error || "Doğrulanmış nöbetçi eczane verisi alınamadı.");
      }
    } catch (err: any) {
      if (requestId !== latestRequest.current) return;
      setDaysData([]);
      setSourceNote("Nöbetçi eczane verisi alınamadı.");
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  };

  // Location is watched once in the shared layout and stays current across pages.
  useEffect(() => {
    if (!userLocation || manualSelection.current) return;
    const { city: detectedCity } = findNearestCityAndDistrict(userLocation.latitude, userLocation.longitude);
    setCity(detectedCity);
    setDistrictList(getLocalDistricts(detectedCity));
    setDistrict("Tümü");
    setLocationNote(`GPS konumunuz alındı (${detectedCity}).`);
    fetchPharmacies(detectedCity, "Tümü", userLocation);
  }, [userLocation]);

  // Current active day's pharmacies
  const activeDayGroup = daysData.find((group) => group.day === selectedDay);
  const activePharmacies = activeDayGroup?.pharmacies || [];

  return (
    <main>
      <section className="hero-section py-3 sm:py-8">
        <AdRail side="left" />
        <div className="hero-content container">
          <h1 className="text-lg sm:text-3xl font-black mb-2 sm:mb-4">
            En Yakın <span>Nöbetçi Eczaneyi</span> Bul
          </h1>

          <div className="search-panel max-w-2xl mx-auto bg-white p-3 sm:p-5 rounded-2xl shadow-xl border border-red-100">
            {/* Mobilde harita, başlığın altındaki ekran alanını doldurur. */}
            <div className="pharmacy-hero-map w-full my-3 sm:my-4 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white relative z-0">
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

            {/* Yaşlılar ve Herkes İçin Son Derece Sade İl / İlçe Seçimi */}
            <div className="bg-slate-50/90 p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                {/* 1. Şehir / İl Seçimi */}
                <div>
                  <label className="block text-sm sm:text-base font-extrabold text-slate-900 mb-1.5">
                    1. Şehir (İl) Seçin:
                  </label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      aria-label="İl seçin"
                      disabled={loading}
                      className="w-full h-12 sm:h-13 px-4 py-2 text-base font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all cursor-pointer"
                    >
                      {cityList.length > 0 ? (
                        cityList.map((item) => (
                          <option key={item.slug} value={item.name} className="py-2 text-base">
                            {item.name}
                          </option>
                        ))
                      ) : (
                        <option value="İstanbul">İstanbul</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* 2. İlçe Seçimi */}
                <div>
                  <label className="block text-sm sm:text-base font-extrabold text-slate-900 mb-1.5">
                    2. İlçe Seçin:
                  </label>
                  <div className="relative">
                    <select
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      aria-label="İlçe seçin"
                      disabled={loading}
                      className="w-full h-12 sm:h-13 px-4 py-2 text-base font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all cursor-pointer"
                    >
                      <option value="Tümü">Tüm İlçeler ({districtList.length})</option>
                      {districtList.map((dist) => (
                        <option key={dist} value={dist} className="py-2 text-base">
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Listele Butonu */}
              <button
                type="button"
                className="w-full mt-3.5 h-12 sm:h-13 bg-red-600 hover:bg-red-700 text-white font-black text-base rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => fetchPharmacies(city, district)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                )}
                <span>Nöbetçi Eczaneleri Göster</span>
              </button>
            </div>

            {/* Konum Bildirim Çubuğu (Dinamik ve Net) */}
            <div className={`mt-3.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-center transition-all ${
              userLocation 
                ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                : "bg-amber-50 border-amber-300 text-amber-900"
            }`}>
              {userLocation ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>📍 Konum bilgisi alındı, eczaneler mesafeye göre listelendi.</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Konum bilgisi alınamadı, lütfen yukarıdan il ve ilçe seçiniz.</span>
                </>
              )}
            </div>
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
              {/* Sade ve Şık Sıralama Rozeti */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-extrabold text-xs border border-red-200 mb-2">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>En yakından en uzağa göre sıralandı</span>
              </div>

              <p className="eyebrow uppercase font-bold tracking-wider text-red-600">
                {city} {district !== "Tümü" ? `· ${district}` : "· TÜM İLÇELER"}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                Nöbetçi Eczaneler
              </h2>
              {sourceNote && <p className="text-xs text-gray-600 mt-1">Kaynak: {sourceNote}{activeDayGroup?.date ? ` · ${activeDayGroup.date}` : ""}</p>}
            </div>

            {/* Dün / Bugün / Yarın Buttons - Mobil Uyumlu Kayan/Esnek Yapı */}
            <div className="w-full sm:w-auto overflow-x-auto no-scrollbar flex items-center justify-between gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
              {(["Dün", "Bugün", "Yarın"] as const).map((day) => {
                const dGroup = daysData.find((group) => group.day === day);
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedPharmacy(0);
                    }}
                    className={`flex-1 sm:flex-initial py-2 px-2.5 sm:px-3.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? "bg-red-600 text-white shadow-xs"
                        : "text-gray-700 hover:text-gray-950 hover:bg-white/80"
                    }`}
                  >
                    <span>{day}</span>
                    {dGroup?.date && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isSelected ? "bg-red-700 text-white" : "text-gray-500"
                        }`}
                      >
                        {dGroup.date.slice(5).replace("-", "/")}
                      </span>
                    )}
                    {dGroup && <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isSelected ? "bg-white text-red-600" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {dGroup.count}
                    </span>}
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
                {selectedDay !== "Bugün" && !activeDayGroup ? `${selectedDay} için nöbet listesi mevcut değil` : "Seçilen bölgede nöbetçi eczane bulunamadı"}
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">{selectedDay !== "Bugün" && !activeDayGroup ? "Veri kaynağı bu güne ait liste yayımlamıyor. Bugün sekmesinden güncel nöbetçi eczaneleri görebilirsiniz." : sourceNote || "Konum izni verin veya il ve ilçe seçerek arama yapın. Veri bulunamazsa yerel eczacı odasının listesini kontrol edin."}</p>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sağlık Portalı & İnteraktif Eczane Araçları (Interactive Health Portal Bento) */}
      <section className="py-14 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200" id="saglik-portali-araclari">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                TÜRKİYE SAĞLIK & ECZANE PORTALI
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Eczane & Sağlık Yardımcı Araçları
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
                SGK katkı payı hesaplama, anlık şehir polen ve hava kalitesi durumu, TİTCK ilaç toplatma bültenleri ve Kızılay kan bağış rehberi.
              </p>
            </div>

            <Link
              href="/saglik-araclari"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all shrink-0 self-start md:self-auto"
            >
              <span>Tüm Araçları Aç</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: SGK Katkı Payı */}
            <Link
              href="/saglik-araclari"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-all mb-4">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  SGK Katkı Payı & Eşdeğer Farkı
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Reçetenizdeki ilaçların çalışan (%20) veya emekli (%10) katkı payını, muayene ücretini ve eşdeğer taban fiyat farkını anında hesaplayın.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Hesaplama Motoru</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Polen & Hava Kalitesi */}
            <Link
              href="/saglik-araclari"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-cyan-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-100 group-hover:bg-cyan-600 text-cyan-700 group-hover:text-white flex items-center justify-center transition-all mb-4">
                  <Wind className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                  Polen & Hava Kalitesi İndeksi
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  81 il için anlık AQI hava kirliliği, ağaç/çim polen yoğunluğu, astım ve alerjik rinit hastaları için uzman klinik sağlık önerileri.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
                <span>Canlı Risk Durumu</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3: TİTCK İlaç Geri Çekme */}
            <Link
              href="/saglik-araclari"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-600 text-amber-700 group-hover:text-white flex items-center justify-center transition-all mb-4">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  TİTCK İlaç Geri Çekme Bildirimleri
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Sağlık Bakanlığı tarafından duyurulan 1. ve 2. sınıf toplatma kararları, etkilenen parti numaraları ve sahte ilaç uyarıları.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Resmi Bülten Sorgula</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4: İlaç & Besin Etkileşimi */}
            <Link
              href="/saglik-araclari"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white flex items-center justify-center transition-all mb-4">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  İlaç-Besin Etkileşim Kontrolü
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Ağrı kesici, antibiyotik veya tansiyon ilaçlarının alkol, greyfurt, süt ve kahve ile etkileşim riskini tek tıkla sorgulayın.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>Etkileşim Testi</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 5: Kızılay Kan Bağışı */}
            <Link
              href="/saglik-araclari"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-100 group-hover:bg-red-600 text-red-700 group-hover:text-white flex items-center justify-center transition-all mb-4">
                  <Droplets className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                  Kızılay Kan Bağışı & Uyumluluk
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Kan grupları uyumluluk matrisi, kimden alınır kime verilir rehberi, bağış kriterleri ve en yakın Kızılay kan merkezleri.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-700">
                <span>Kan Merkezleri & Matris</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 6: 7/24 Acil İlk Yardım */}
            <Link
              href="/saglik-araclari"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 group-hover:bg-rose-600 text-rose-700 group-hover:text-white flex items-center justify-center transition-all mb-4">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                  7/24 Acil İlk Yardım Rehberi
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Heimlich manevrası, yanık ilk müdahalesi, kalp krizi belirtileri ve 114 UZEM zehirlenme acil protokolleri.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
                <span>Acil Rehberi Aç</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Rehber & Sıkça Sorulan Sorular (Google / Yandex Search Optimization) */}
      <section className="py-12 bg-white border-t border-gray-100" id="sikca-sorulan-sorular">
        <div className="container max-w-5xl">
          <div className="mb-8">
            <span className="eyebrow uppercase font-extrabold text-red-600 tracking-wider">
              NÖBETÇİ ECZANE REHBERİ & SSS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Nöbetçi Eczaneler Hakkında Bilmeniz Gerekenler
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Türkiye genelinde 81 ilde nöbetçi eczane sistemi, acil ilaç temini ve nöbet saatleri ile ilgili resmi mevzuat kuralları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <Clock3 size={18} className="text-red-600 shrink-0" />
                Nöbetçi eczaneler kaça kadar açık?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Nöbetçi eczaneler normal çalışma mesaisi bittiğinde (akşam 19:00 civarı) nöbete başlar ve <strong>ertesi gün sabah saat 09:00'a kadar</strong> kesintisiz 24 saat boyunca açık kalır. Pazar ve resmi tatil günlerinde ise tüm gün nöbetçi sistemi geçerlidir.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-red-600 shrink-0" />
                Nöbetçi eczanede ilaç fiyat farkı var mı?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>Hayır, kesinlikle ekstra nöbet ücreti alınmaz.</strong> Türkiye'deki tüm eczanelerde Sağlık Bakanlığı ve SGK tarafından belirlenen resmi ilaç fiyat tarifesi ve katkı payı oranları 7/24 aynı şekilde uygulanır.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <Cross size={18} className="text-red-600 shrink-0" />
                Reçetesiz veya raporlu ilaç alınabilir mi?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Evet. T.C. kimlik numaranız ile sisteme kayıtlı raporlu ilaçlarınızı, hekiminizin yazdığı e-reçeteleri ve reçetesiz satılan ilk yardım/ağrı kesici ürünlerini nöbetçi eczanelerden temin edebilirsiniz.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin size={18} className="text-red-600 shrink-0" />
                En yakın nöbetçi eczaneye nasıl gidilir?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Konum izni verildiğinde yakınınızdaki kayıtlar otomatik listelenir. Bölgeyi elle değiştirmek için il ve ilçe seçip <strong>"Nöbetçi Eczaneleri Göster"</strong> butonuna basabilirsiniz.
              </p>
            </div>
          </div>

          {/* Hızlı Şehir Nöbetçi Eczane Bağlantıları (SEO Internal Links) */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4">
              Popüler İl & İlçe Nöbetçi Eczane Sorgulama
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "İstanbul Kadıköy",
                "İstanbul Beşiktaş",
                "İstanbul Üsküdar",
                "İstanbul Bakırköy",
                "İstanbul Şişli",
                "Ankara Çankaya",
                "Ankara Keçiören",
                "Ankara Yenimahalle",
                "İzmir Konak",
                "İzmir Karşıyaka",
                "İzmir Bornova",
                "Bursa Osmangazi",
                "Bursa Nilüfer",
                "Antalya Muratpaşa",
                "Adana Seyhan",
                "Konya Selçuklu",
                "Gaziantep Şahinbey",
              ].map((loc) => {
                const parts = loc.split(" ");
                const cName = parts[0];
                const dName = parts.slice(1).join(" ");
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setCity(cName);
                      const districts = getLocalDistricts(cName);
                      setDistrictList(districts);
                      setDistrict(dName);
                      fetchPharmacies(cName, dName, userLocation);
                      document.getElementById("sonuclar")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-gray-200 text-xs font-bold text-gray-700 transition-all cursor-pointer"
                  >
                    {loc} Nöbetçi Eczane
                  </button>
                );
              })}
            </div>
          </div>
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
              <p>Konum izni verildiğinde bölgeniz otomatik seçilir. İsterseniz il ve ilçe seçebilirsiniz.</p>
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
            <h2>Nöbetçi listelerinin güncelliğini kontrol edin.</h2>
            <p>
              Kaynak ve tarih bilgisi sonuçların yanında gösterilir. Veri alınamadığında örnek eczane kaydı
              gösterilmez. Gitmeden önce eczaneyi arayarak nöbet durumunu teyit edin.
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
