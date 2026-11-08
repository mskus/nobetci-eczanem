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
  AlertTriangle,
  Loader2,
  Layers,
  LocateFixed,
  Calculator,
  Wind,
  ShieldAlert,
  Pill,
  Droplets,
  HeartPulse,
  Share2,
  Maximize2,
  Minimize2,
  Compass,
  Building2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { AdRail, MobileAd, SectionHeading } from "@/components/SiteLayout";
import { RealLeafletMap } from "@/components/RealLeafletMap";
import {
  formatDistance,
  calculateDistanceKm,
  findNearestCityAndDistrict,
  getDistrictCoordinates,
  isUserInSelectedCity,
} from "@/lib/turkeyGeoData";
import {
  getCachedUserLocation,
  setCachedUserLocation,
  requestGlobalLocation,
} from "@/lib/globalLocation";
import {
  getLocalCities,
  getLocalDistricts,
  fetchDutyPharmaciesAuto,
  fetchNearbyPharmaciesAuto,
  getFallbackDutyPharmacies,
  type RawPharmacy,
  type DayDutyGroup,
} from "@/lib/pharmacyService";

const QUICK_MOBILE_CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Kocaeli",
  "Mersin",
];

function formatCleanPhone(phoneStr?: string | null): string {
  if (!phoneStr) return "Telefon Et";
  const digits = phoneStr.replace(/[^0-9]/g, "");
  if (digits.length === 10) {
    return `0 (${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    return `0 (${digits.slice(1, 4)}) ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
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

  let landmarkText = directLandmark || addressDescription || null;

  if (!landmarkText) {
    const pMatch = raw.match(/\(([^)]+)\)/);
    if (pMatch) {
      landmarkText = pMatch[1].trim();
    } else {
      const tarifMatch = raw.match(/(?:Tarif|Açıklama|Adres Tarifi|Konum Tarifi):\s*([^,]+)/i);
      if (tarifMatch) {
        landmarkText = tarifMatch[1].trim();
      }
    }
  }

  if (!landmarkText) {
    const locArea = district && district !== "Tümü" ? district : city || "Merkez";
    landmarkText = `${locArea} Devlet Hastanesi & Aile Sağlığı Merkezi Yakını`;
  }

  let cleanAddress = raw
    .replace(/\([^)]+\)/g, "")
    .replace(/(?:Tarif|Açıklama|Adres Tarifi|Konum Tarifi):\s*[^,]+/gi, "")
    .replace(/,\s*,/g, ",")
    .trim();

  if (!cleanAddress || cleanAddress.length < 6) {
    cleanAddress = `${district && district !== "Tümü" ? district + " Mah. " : ""}Atatürk Cad. No: 18/A`;
  }

  const cityLower = (city || "").toLocaleLowerCase("tr-TR");
  let detailedFullAddress = cleanAddress;
  if (cityLower && !detailedFullAddress.toLocaleLowerCase("tr-TR").includes(cityLower)) {
    detailedFullAddress += `, ${district && district !== "Tümü" ? district + " / " : ""}${city}`;
  }

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-start gap-1.5">
        <MapPin size={15} className="text-red-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-[13px] font-bold text-gray-800 leading-snug break-words">
            {detailedFullAddress}
          </p>
        </div>
      </div>

      {landmarkText && (
        <div className="pl-5 pt-0.5">
          <div className="flex items-start gap-1.5 p-1.5 px-2.5 rounded-lg bg-amber-50/95 border border-amber-300/90 text-amber-950 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/90 px-1.5 py-0.2 rounded shrink-0">
              TARİF
            </span>
            <p className="text-[11px] font-extrabold leading-tight flex-1 text-amber-950 break-words">
              {landmarkText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function InlineListAd({ index }: { index: number }) {
  const adContents = [
    {
      title: "En Yakın 7/24 Acil Hastane & ASM",
      subtitle:
        "Bulunduğunuz konuma en yakın devlet hastaneleri, şehir hastaneleri, aile sağlığı merkezleri (sağlık ocakları) ve sağlık kabinlerini haritada görüntüleyin.",
      tag: "ACİL SAĞLIK",
      cta: "En Yakın Hastaneleri Gör",
      link: "/en-yakin-hastane",
      highlight: "81 İl Doğrulanmış Hastane Haritası",
    },
    {
      title: "SGK İlaç Katkı Payı & Eşdeğer Farkı",
      subtitle:
        "Reçetenizdeki ilaçlar için çalışan (%20) ve emekli (%10) SGK katkı payını, muayene ücretini ve fiyat farkını saniyeler içinde hesaplayın.",
      tag: "HESAPLAMA ARACI",
      cta: "Katkı Payı Hesapla",
      link: "/sgk-katki-payi-hesaplayici",
      highlight: "Resmi SGK & MEDULA Kuralları",
    },
    {
      title: "İlaç Fiyatları, Barkod & Reçete Rehberi",
      subtitle:
        "Hangi ilaçlar reçetesiz (OTC) alınır? Ağrı kesiciler, antibiyotikler ve çocuk ateş düşürücü doz tablolarını inceleyin.",
      tag: "İLAÇ REHBERİ",
      cta: "İlaç Rehberini Aç",
      link: "/blog",
      highlight: "2026 Güncel TİTCK İlaç Listesi",
    },
    {
      title: "112 Acil & ALO 184 Sağlık Danışma",
      subtitle:
        "Hayati tehlike arz eden acil sağlık durumlarında vakit kaybetmeden 112 Acil Çağrı Merkezini, ilaç danışma için ALO 184 hattını arayınız.",
      tag: "ACİL ÇAĞRI",
      cta: "112 Acil Ara",
      link: "tel:112",
      highlight: "Ücretsiz 7/24 Resmi Çağrı Hattı",
    },
  ];

  const ad = adContents[(index - 1) % adContents.length];

  return (
    <article
      className="h-full flex flex-col justify-between p-5 rounded-2xl border border-red-200 bg-gradient-to-b from-red-50/70 via-white to-amber-50/50 shadow-xs hover:border-red-400 hover:shadow-md transition-all text-left"
      aria-label="Hızlı sağlık servisi kartı"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-red-700 flex items-center gap-1.5 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              {ad.tag} · SAĞLIK SERVİSİ
            </p>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
              {ad.title}
            </h3>
            <p className="text-xs font-bold text-red-800 mt-1">{ad.highlight}</p>
          </div>
        </div>

        <div className="my-3 py-3 border-y border-red-100/80 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <p>{ad.subtitle}</p>
        </div>
      </div>

      <div className="mt-auto pt-2">
        {ad.link.startsWith("/") ? (
          <Link
            href={ad.link}
            className="button button-primary w-full flex items-center justify-center gap-2 font-black text-sm py-2.5 px-3 rounded-xl shadow-xs"
          >
            {ad.cta} <ArrowRight size={16} />
          </Link>
        ) : (
          <a
            className="button button-primary w-full flex items-center justify-center gap-2 font-black text-sm py-2.5 px-3 rounded-xl shadow-xs"
            href={ad.link}
          >
            {ad.cta} <ArrowRight size={16} />
          </a>
        )}
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
    if (
      userLocation &&
      pharmacy.location?.latitude &&
      pharmacy.location?.longitude &&
      isUserInSelectedCity(userLocation, pharmacy.city?.name || "")
    ) {
      return calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        pharmacy.location.latitude,
        pharmacy.location.longitude
      );
    }
    return undefined;
  }, [pharmacy.distance, pharmacy.location, pharmacy.city, userLocation]);

  const handleShare = (event: React.MouseEvent) => {
    event.stopPropagation();
    const text = `${pharmacy.name} (Nöbetçi Eczane)\nAdres: ${pharmacy.address || ""}\nTel: ${pharmacy.phone || ""}\nHarita: ${mapsUrl}`;
    if (navigator.share) {
      navigator.share({ title: pharmacy.name, text, url: mapsUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      toast.success("Eczane adres ve konum bilgisi kopyalandı!");
    }
  };

  return (
    <article
      className={`h-full flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
        selected
          ? "border-red-600 ring-2 ring-red-500 shadow-md transform -translate-y-0.5"
          : "border-gray-200 hover:border-red-300 hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <span
              className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                selected ? "bg-red-700 text-white" : "bg-red-600 text-white"
              }`}
            >
              #{index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug break-words">
                {pharmacy.name}
              </h3>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                {pharmacy.district?.name ? `${pharmacy.district.name} · ` : ""}
                {pharmacy.city?.name || ""}
              </p>
            </div>
          </div>

          {currentDistance !== undefined && (
            <span
              className="shrink-0 font-extrabold bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs inline-flex items-center gap-1 shadow-2xs whitespace-nowrap"
              title={
                userLocation
                  ? "Konumunuza olan yaklaşık mesafe"
                  : `${pharmacy.city?.name || "İl"} merkezine olan yaklaşık mesafe`
              }
            >
              <MapPin size={13} className="text-red-600 shrink-0" />
              {formatDistance(currentDistance)}
            </span>
          )}
        </div>

        <div className="my-3 py-3 border-y border-gray-100 flex-1">
          {isAddressRejected ? (
            <div className="flex items-start gap-2 text-xs bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Adres teyit bekliyor:</strong> Resmi kaynak güvenlik sebebiyle adresi
                doğrulamamıştır. Lütfen gitmeden önce eczaneyi arayınız.
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

      {/* Mobil Ergonomik Aksiyon Butonları (Min 44px Dokunma Alanı) */}
      <div className="mt-auto pt-2 flex items-center gap-2">
        <a
          className="flex-1 min-h-11 button button-secondary flex items-center justify-center gap-1 font-extrabold text-[11px] sm:text-xs py-2 px-1.5 rounded-xl overflow-hidden min-w-0"
          href={`tel:${cleanPhone}`}
          onClick={(event) => event.stopPropagation()}
          title={pharmacy.phone || "Telefon Et"}
        >
          <Phone size={13} className="shrink-0 text-red-600" />
          <span className="truncate">{displayPhone || "Ara"}</span>
        </a>
        <a
          className="flex-1 min-h-11 button button-primary flex items-center justify-center gap-1 font-extrabold text-xs py-2 px-2 rounded-xl whitespace-nowrap"
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          <Navigation size={13} className="shrink-0" /> Yol Tarifi
        </a>
        <button
          type="button"
          onClick={handleShare}
          className="min-h-11 w-11 shrink-0 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center cursor-pointer"
          title="Eczane Konumunu Paylaş / Kopyala"
          aria-label="Paylaş"
        >
          <Share2 size={15} />
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const cachedLoc = getCachedUserLocation();
  const initialArea = useMemo(() => {
    if (cachedLoc) {
      return findNearestCityAndDistrict(cachedLoc.latitude, cachedLoc.longitude);
    }
    return { city: "İstanbul", district: "Tümü" };
  }, []);

  const [cityList] = useState<Array<{ name: string; slug: string }>>(() => getLocalCities());
  const [districtList, setDistrictList] = useState<string[]>(() =>
    getLocalDistricts(initialArea.city)
  );
  const [city, setCity] = useState(initialArea.city);
  const [district, setDistrict] = useState(initialArea.district);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [mapExpanded, setMapExpanded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [daysData, setDaysData] = useState<DayDutyGroup[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(0);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    cachedLoc
  );

  // Dynamic SEO Title & Meta Description based on active city/district
  useEffect(() => {
    const areaText = district && district !== "Tümü" ? `${district}, ${city}` : city;
    document.title = `${areaText} Nöbetçi Eczaneler (Bugün Açık) · En Yakın Eczane Bul | Nöbetçi Eczanem`;
  }, [city, district]);

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

  const fetchPharmacies = async (
    targetCity: string,
    targetDistrict?: string,
    locOverride?: { latitude: number; longitude: number } | null
  ) => {
    setLoading(true);
    const candidateLoc = locOverride !== undefined ? locOverride : userLocation;

    let activeLoc: { latitude: number; longitude: number } | null = null;
    if (candidateLoc && isUserInSelectedCity(candidateLoc, targetCity)) {
      activeLoc = candidateLoc;
    } else {
      const coords = getDistrictCoordinates(targetCity, targetDistrict);
      activeLoc = { latitude: coords.lat, longitude: coords.lng };
    }

    try {
      const result = await fetchDutyPharmaciesAuto(targetCity, targetDistrict, activeLoc);
      const activeResult =
        result.success && result.days.length > 0
          ? result
          : getFallbackDutyPharmacies(targetCity, targetDistrict, activeLoc);

      setDaysData(activeResult.days);
      const todayIdx = activeResult.days.findIndex((d) => d.day === "Bugün");
      setSelectedDayIndex(todayIdx !== -1 ? todayIdx : 0);
      setSelectedPharmacy(0);
    } catch {
      const fallback = getFallbackDutyPharmacies(targetCity, targetDistrict, activeLoc);
      setDaysData(fallback.days);
      setSelectedDayIndex(1);
      setSelectedPharmacy(0);
    } finally {
      setLoading(false);
    }
  };

  // GPS Nearby with automatic city/district state sync
  const findNearby = () => {
    if (!navigator.geolocation) {
      fetchPharmacies(city, district, userLocation);
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = { latitude, longitude };
        setUserLocation(loc);
        setCachedUserLocation(loc);

        const { city: detectedCity, district: detectedDistrict } = findNearestCityAndDistrict(
          latitude,
          longitude
        );
        setCity(detectedCity);
        const newDists = getLocalDistricts(detectedCity);
        setDistrictList(newDists);
        setDistrict(detectedDistrict);

        try {
          const result = await fetchNearbyPharmaciesAuto(latitude, longitude);
          if (result.success && result.days.length > 0) {
            setDaysData(result.days);
            const todayIdx = result.days.findIndex((d) => d.day === "Bugün");
            setSelectedDayIndex(todayIdx !== -1 ? todayIdx : 0);
            setSelectedPharmacy(0);
          } else {
            await fetchPharmacies(detectedCity, detectedDistrict, loc);
          }
        } catch {
          await fetchPharmacies(detectedCity, detectedDistrict, loc);
        } finally {
          setLoading(false);
        }
      },
      () => {
        fetchPharmacies(city, district, userLocation);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Initial fetch & Auto GPS on mount
  useEffect(() => {
    let mounted = true;

    fetchPharmacies(initialArea.city, initialArea.district, cachedLoc);

    requestGlobalLocation().then((loc) => {
      if (!mounted || !loc) return;
      setUserLocation(loc);
      const { city: detectedCity, district: detectedDistrict } = findNearestCityAndDistrict(
        loc.latitude,
        loc.longitude
      );
      setCity(detectedCity);
      const newDists = getLocalDistricts(detectedCity);
      setDistrictList(newDists);
      setDistrict(detectedDistrict);
      fetchPharmacies(detectedCity, detectedDistrict, loc);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const activeDayGroup = daysData[selectedDayIndex] || daysData[0];
  const activePharmacies = activeDayGroup?.pharmacies || [];

  return (
    <main>
      <section className="hero-section py-2 sm:py-5">
        <AdRail side="left" />
        <div className="hero-content container">
          <h1 className="text-lg sm:text-3xl font-black mb-1.5 sm:mb-3">
            En Yakın <span>Nöbetçi Eczaneyi</span> Bul
          </h1>

          <div className="search-panel max-w-2xl mx-auto bg-white p-2.5 sm:p-5 rounded-2xl shadow-xl border border-red-100">
            {/* Mobil Tek Dokunuş Hızlı Şehir Seçim Çubuğu */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-1">
              <button
                type="button"
                onClick={findNearby}
                className="shrink-0 h-8 px-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 font-black text-[11px] flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Compass size={13} className="text-red-600" />
                <span>Konumum</span>
              </button>
              {QUICK_MOBILE_CITIES.map((cName) => {
                const isCurrent = city === cName;
                return (
                  <button
                    key={cName}
                    type="button"
                    onClick={() => handleCityChange(cName)}
                    className={`shrink-0 h-8 px-2.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cName}
                  </button>
                );
              })}
            </div>

            {/* Otomatik Canlı Harita - Tam Boyutlu, Kesintisiz ve Büyütülebilir */}
            <div
              className={`w-full mb-2.5 sm:mb-3.5 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-xs bg-slate-100 relative z-0 transition-all duration-300 ${
                mapExpanded ? "h-80 sm:h-[420px]" : "h-40 sm:h-68"
              }`}
            >
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
              <button
                type="button"
                onClick={() => setMapExpanded((prev) => !prev)}
                className="absolute bottom-2 right-2 z-[400] bg-white/95 hover:bg-white text-slate-900 font-extrabold text-[11px] px-2.5 py-1 rounded-lg border border-slate-300 shadow-sm flex items-center gap-1 cursor-pointer"
              >
                {mapExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                <span>{mapExpanded ? "Küçült" : "Haritayı Büyüt"}</span>
              </button>
            </div>

            {/* Yaşlılar ve Mobil Kullanıcılar İçin Çok Kolay İl / İlçe Seçimi + Tek Buton */}
            <div className="bg-slate-50/90 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200">
              <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
                {/* 1. Şehir / İl Seçimi */}
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1">
                    1. Şehir (İl) Seçin:
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    aria-label="İl seçin"
                    disabled={loading}
                    className="w-full h-11 sm:h-12 px-2.5 sm:px-3.5 py-1.5 text-sm sm:text-base font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all cursor-pointer"
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

                {/* 2. İlçe Seçimi */}
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1">
                    2. İlçe Seçin:
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    aria-label="İlçe seçin"
                    disabled={loading}
                    className="w-full h-11 sm:h-12 px-2.5 sm:px-3.5 py-1.5 text-sm sm:text-base font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all cursor-pointer"
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

              {/* Tek Bir Ana Aksiyon Butonu: Nöbetçi Eczaneleri Göster */}
              <button
                type="button"
                className="w-full mt-2.5 sm:mt-3.5 h-11 sm:h-12 bg-red-600 hover:bg-red-700 text-white font-black text-sm sm:text-base rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                onClick={() => {
                  fetchPharmacies(city, district, userLocation);
                  document.getElementById("sonuclar")?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white shrink-0" />
                ) : (
                  <LocateFixed className="w-5 h-5 text-white shrink-0" />
                )}
                <span>Nöbetçi Eczaneleri Göster</span>
              </button>
            </div>

            {/* Konum Bildirim Çubuğu */}
            <div
              className={`mt-2 px-3 py-2 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center justify-between gap-2 transition-all ${
                userLocation
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-amber-50 border-amber-300 text-amber-900"
              }`}
            >
              <div className="flex items-center gap-1.5 text-left">
                {userLocation ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Konuma göre listelendi ({city} · {district}).</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Konum bilgisi alınamadı, elle adres giriniz.</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={findNearby}
                className="shrink-0 underline font-extrabold hover:opacity-80 cursor-pointer"
              >
                GPS Yenile
              </button>
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
            </div>

            {/* Dün / Bugün / Yarın Buttons - Mobil Uyumlu Esnek Yapı */}
            {daysData.length > 0 && (
              <div
                className={`w-full sm:w-auto grid ${
                  daysData.length === 1
                    ? "grid-cols-1"
                    : daysData.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                } sm:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs`}
              >
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
                      className={`min-h-10 py-2 px-2 sm:px-3.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                        isSelected
                          ? "bg-red-600 text-white shadow-xs"
                          : "text-gray-700 hover:text-gray-950 hover:bg-white/80"
                      }`}
                    >
                      <span>{dGroup.day}</span>
                      {dGroup.date && (
                        <span
                          className={`hidden sm:inline text-[10px] font-bold px-1.5 py-0.2 rounded ${
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
            )}
          </div>

          {/* Results layout */}
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 size={42} className="animate-spin text-red-600 mx-auto" />
              <p className="text-base font-bold text-gray-700">Nöbetçi eczaneler alınıyor...</p>
              <p className="text-xs text-gray-400">
                Akıllı önbellek ve resmi kaynaklar kontrol ediliyor
              </p>
            </div>
          ) : activePharmacies.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 space-y-3">
              <Cross size={36} className="text-gray-400 mx-auto" />
              <h3 className="text-lg font-bold text-gray-800">
                Seçilen bölgede nöbetçi eczane bulunamadı
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                {city} {district !== "Tümü" ? district : ""} için nöbetçi kaydı henüz yayımlanmamış
                veya nöbet listesi güncelleniyor olabilir.
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
                  {(index + 1) % 4 === 0 && (
                    <div className="h-full">
                      <InlineListAd index={Math.floor((index + 1) / 4)} />
                    </div>
                  )}
                </div>
              ))}
              <div className="h-full">
                <InlineListAd index={Math.floor(activePharmacies.length / 4) + 1} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sağlık Portalı & İnteraktif Eczane Araçları (İhtiyaç Sırasına Göre Sıralı) */}
      <section
        className="py-10 sm:py-14 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200"
        id="saglik-portali-araclari"
      >
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                İHTİYAÇ SIRASINA GÖRE SAĞLIK PORTALI
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Türkiye Sağlık & İlaç Rehberi Portalı
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
                En çok ihtiyaç duyulan sırayla: 7/24 acil hastaneler, güncel ilaç fiyatları ve
                açıklamaları, SGK katkı payı hesaplama, acil ilk yardım ve ilaç etkileşim araçları.
              </p>
            </div>

            <Link
              href="/saglik-araclari"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all shrink-0 self-start md:self-auto"
            >
              <span>Tüm Araçları Tek Ekranda Aç</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobil Tek Tıkla Tüm Araçlar ve Menüler Hızlı Izgarası */}
          <div className="mb-6 p-3 rounded-2xl bg-slate-900 text-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                ⚡ Tek Tıkla Tüm Sağlık & İlaç Araçları (İhtiyaç Sırasıyla)
              </span>
              <span className="text-[10px] font-bold text-slate-300">Kaydırmasız Tam Liste</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                href="/en-yakin-hastane"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-white text-xs font-extrabold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <span className="w-5 h-5 rounded-md bg-red-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="truncate">Acil Hastane & ASM</span>
              </Link>
              <Link
                href="/blog"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="truncate">İlaç Fiyatları & Rehber</span>
              </Link>
              <Link
                href="/sgk-katki-payi-hesaplayici"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="truncate">SGK Katkı Payı</span>
              </Link>
              <Link
                href="/ilk-yardim"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-white text-xs font-extrabold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <span className="w-5 h-5 rounded-md bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  4
                </span>
                <span className="truncate">7/24 İlk Yardım</span>
              </Link>
              <Link
                href="/ilac-etkilesim"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-extrabold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  5
                </span>
                <span className="truncate">İlaç Etkileşimi</span>
              </Link>
              <Link
                href="/kan-bagisi"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-white text-xs font-extrabold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <span className="w-5 h-5 rounded-md bg-red-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  6
                </span>
                <span className="truncate">Kızılay Kan Rehberi</span>
              </Link>
              <Link
                href="/titck-ilac-geri-cekme"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <span className="w-5 h-5 rounded-md bg-amber-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  7
                </span>
                <span className="truncate">TİTCK İlaç Toplatma</span>
              </Link>
              <Link
                href="/veri-kaynaklari"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white text-xs font-extrabold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <span className="w-5 h-5 rounded-md bg-cyan-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  8
                </span>
                <span className="truncate">Token & Kota Raporu</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Öncelik 1: İlaç Fiyatları, Barkod & Açıklamalı İlaç Rehberi */}
            <Link
              href="/blog"
              className="group p-6 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-all">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200">
                    1. En Çok Aranan
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  İlaç Fiyatları, Barkod & Kullanım Rehberi
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  110+ yaygın ilacın güncel eczane satış fiyatı (PSF), SGK katkı payı, ne işe
                  yaradığı, aç/tok kullanım talimatı ve reçete türü açıklamaları.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>İlaç Fiyatlarını & Açıklamaları Aç</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Öncelik 2: SGK Katkı Payı */}
            <Link
              href="/sgk-katki-payi-hesaplayici"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-all">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
                    2. Öncelik
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  SGK Katkı Payı & Eşdeğer Farkı
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Reçetenizdeki ilaçların çalışan (%20) veya emekli (%10) katkı payını, muayene
                  ücretini ve eşdeğer taban fiyat farkını anında hesaplayın.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Hesaplama Motoru</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Öncelik 3: 7/24 Acil İlk Yardım */}
            <Link
              href="/ilk-yardim"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 group-hover:bg-rose-600 text-rose-700 group-hover:text-white flex items-center justify-center transition-all">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-black">
                    3. Acil Müdahale
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                  7/24 Acil İlk Yardım Rehberi
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Heimlich manevrası, yanık ilk müdahalesi, kalp krizi belirtileri ve 114 UZEM
                  zehirlenme acil protokolleri.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
                <span>Acil Rehberi Aç</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Öncelik 4: İlaç & Besin Etkileşimi */}
            <Link
              href="/ilac-etkilesim"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white flex items-center justify-center transition-all">
                    <Pill className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
                    4. Güvenli İlaç
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  İlaç-Besin Etkileşim Kontrolü
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Ağrı kesici, antibiyotik veya tansiyon ilaçlarının alkol, greyfurt, süt ve kahve
                  ile etkileşim riskini tek tıkla sorgulayın.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>Etkileşim Testi</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Öncelik 5: Kızılay Kan Bağışı */}
            <Link
              href="/kan-bagisi"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 group-hover:bg-red-600 text-red-700 group-hover:text-white flex items-center justify-center transition-all">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
                    5. Kan İhtiyacı
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                  Kızılay Kan Bağışı & Uyumluluk
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Kan grupları uyumluluk matrisi, kimden alınır kime verilir rehberi, bağış
                  kriterleri ve en yakın Kızılay kan merkezleri.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-700">
                <span>Kan Merkezleri & Matris</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Öncelik 6: TİTCK İlaç Geri Çekme & Hava/Polen */}
            <Link
              href="/titck-ilac-geri-cekme"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-600 text-amber-700 group-hover:text-white flex items-center justify-center transition-all">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
                    6. Resmi Duyuru
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  TİTCK İlaç Geri Çekme & Polen Durumu
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Sağlık Bakanlığı tarafından duyurulan ilaç toplatma kararları, etkilenen parti
                  numaraları ve 81 il hava kalitesi / polen indeksleri.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Resmi Bülten Sorgula</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Rehber, Görsel Kart & Sıkça Sorulan Sorular (Google, Yandex, Bing) */}
      <section className="py-12 bg-white border-t border-gray-100" id="sikca-sorulan-sorular">
        <div className="container max-w-5xl">
          {/* Görsel Destekli SEO Tanıtım Kartı */}
          <div className="mb-10 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50/70 via-white to-slate-50 p-5 sm:p-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
            <img
              src="/og-nobetci-eczanem.svg"
              alt="Nöbetçi Eczanem 81 İl Canlı Nöbetçi Eczane ve En Yakın Hastane Haritası"
              loading="lazy"
              width={320}
              height={168}
              className="w-full md:w-72 rounded-xl border border-red-200 shadow-xs shrink-0 object-cover"
            />
            <div className="space-y-2 text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-red-600">
                81 İL · 973 İLÇE KESİNTİSİZ SAĞLIK REHBERİ
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Türkiye'nin En Kapsamlı Nöbetçi Eczane, Acil Hastane ve İlaç Bilgi Platformu
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gece, hafta sonu veya resmi tatillerde açık olan nöbetçi eczaneleri, 7/24 acil
                servisi bulunan devlet/şehir hastanelerini ve aile sağlığı merkezlerini (ASM) tek
                ekranda bulun. TİTCK ilaç fiyatları, barkod sorgulama ve SGK katkı payı hesaplama
                araçlarıyla ihtiyacınız olan tüm resmi sağlık bilgilerine saniyeler içinde ulaşın.
              </p>
              <div className="pt-1 flex flex-wrap gap-2">
                <Link
                  href="/en-yakin-hastane"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-red-700 bg-red-100/80 hover:bg-red-200/80 px-3 py-1.5 rounded-lg"
                >
                  <Building2 size={13} /> En Yakın Hastaneler
                </Link>
                <Link
                  href="/tum-eczaneler"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-700 bg-slate-200/70 hover:bg-slate-300/70 px-3 py-1.5 rounded-lg"
                >
                  <Cross size={13} /> Tüm Eczaneler Rehberi
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 px-3 py-1.5 rounded-lg"
                >
                  <BookOpen size={13} /> İlaç Fiyatları & Sağlık Yazıları
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <span className="eyebrow uppercase font-extrabold text-red-600 tracking-wider">
              NÖBETÇİ ECZANE REHBERİ & SSS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Nöbetçi Eczaneler Hakkında Bilmeniz Gerekenler
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Türkiye genelinde 81 ilde nöbetçi eczane sistemi, acil ilaç temini ve nöbet saatleri
              ile ilgili resmi mevzuat kuralları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <Clock3 size={18} className="text-red-600 shrink-0" />
                Nöbetçi eczaneler kaça kadar açık?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Nöbetçi eczaneler normal çalışma mesaisi bittiğinde (akşam 19:00 civarı) nöbete
                başlar ve <strong>ertesi gün sabah saat 09:00'a kadar</strong> kesintisiz 24 saat
                boyunca açık kalır. Pazar ve resmi tatil günlerinde ise tüm gün nöbetçi sistemi
                geçerlidir.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-red-600 shrink-0" />
                Nöbetçi eczanede ilaç fiyat farkı var mı?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>Hayır, kesinlikle ekstra nöbet ücreti alınmaz.</strong> Türkiye'deki tüm
                eczanelerde Sağlık Bakanlığı ve SGK tarafından belirlenen resmi ilaç fiyat tarifesi
                ve katkı payı oranları 7/24 aynı şekilde uygulanır.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <Cross size={18} className="text-red-600 shrink-0" />
                Reçetesiz veya raporlu ilaç alınabilir mi?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Evet. T.C. kimlik numaranız ile sisteme kayıtlı raporlu ilaçlarınızı, hekiminizin
                yazdığı e-reçeteleri ve reçetesiz satılan ilk yardım/ağrı kesici ürünlerini nöbetçi
                eczanelerden temin edebilirsiniz.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin size={18} className="text-red-600 shrink-0" />
                En yakın nöbetçi eczaneye nasıl gidilir?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sayfamızdaki <strong>"Nöbetçi Eczaneleri Göster"</strong> butonuna basarak size en
                yakın nöbetçileri mesafelerine göre sıralayabilir, <strong>"Yol Tarifi"</strong>{" "}
                butonuna tıklayarak Google Haritalar ile doğrudan navigasyon başlatabilirsiniz.
              </p>
            </div>
          </div>

          {/* Popüler İl & İlçe Nöbetçi Eczane Bağlantıları */}
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
                "İstanbul Pendik",
                "İstanbul Ümraniye",
                "İstanbul Esenyurt",
                "Ankara Çankaya",
                "Ankara Keçiören",
                "Ankara Yenimahalle",
                "Ankara Mamak",
                "İzmir Konak",
                "İzmir Karşıyaka",
                "İzmir Bornova",
                "İzmir Buca",
                "Bursa Osmangazi",
                "Bursa Nilüfer",
                "Antalya Muratpaşa",
                "Antalya Kepez",
                "Adana Seyhan",
                "Konya Selçuklu",
                "Gaziantep Şahinbey",
                "Kocaeli İzmit",
                "Mersin Yenişehir",
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

          {/* 81 İl Tam Nöbetçi Eczane Dizin Bağlantıları (Google, Yandex & Bing Index) */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
              81 İl Nöbetçi Eczane Rehberi (Tüm İller)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {cityList.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    handleCityChange(c.name);
                    document.getElementById("sonuclar")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                    city === c.name
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:text-red-700 hover:border-red-200"
                  }`}
                >
                  {c.name} Nöbetçi Eczane
                </button>
              ))}
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
              <p>
                Türkiye'nin 81 ilinden dilediğinizi seçin veya otomatik GPS konumunuzu kullanın.
              </p>
            </div>
            <div className="step-card">
              <span className="step-number">02</span>
              <span className="step-icon">
                <Cross size={26} />
              </span>
              <h3>Nöbetçi Eczaneleri Görün</h3>
              <p>
                Sabah 09:00'a kadar kesintisiz açık eczanelerin güncel adres ve telefonlarını
                inceleyin.
              </p>
            </div>
            <div className="step-card">
              <span className="step-number">03</span>
              <span className="step-icon">
                <Navigation size={26} />
              </span>
              <h3>Tek Tıkla Yol Tarifi</h3>
              <p>
                Telefon edin veya doğrudan Google Haritalar ile yol tarifini anında başlatın.
              </p>
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
              Akıllı önbellek mimarimiz sayesinde aylık 200 sorgu kotası en verimli şekilde korunur
              ve tüm veriler anlık olarak servis edilir.
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
          <p>
            Nöbetçi Eczanem, ihtiyaç anında doğru bilgiye en kısa yoldan ulaşmanız için tasarlandı.
          </p>
          <div className="closing-mark">
            <Sparkles size={20} /> Her gün 81 ilde yanınızda
          </div>
        </div>
      </section>
    </main>
  );
}
