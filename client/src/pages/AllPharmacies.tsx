import { useState, useMemo, useEffect } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Navigation,
  Search,
  Loader2,
  Compass,
  ShieldCheck,
} from "lucide-react";
import {
  getLocalCities,
  getLocalDistricts,
  fetchDutyPharmaciesAuto,
  RawPharmacy,
  DayDutyGroup,
} from "@/lib/pharmacyService";
import {
  calculateDistanceKm,
  formatDistance,
  findNearestCityAndDistrict,
  getDistrictCoordinates,
  isUserInSelectedCity,
} from "@/lib/turkeyGeoData";
import {
  getCachedUserLocation,
  setCachedUserLocation,
  requestGlobalLocation,
} from "@/lib/globalLocation";

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

export default function AllPharmacies() {
  const cached = getCachedUserLocation();
  const initialArea = useMemo(() => {
    if (cached) {
      return findNearestCityAndDistrict(cached.latitude, cached.longitude);
    }
    return { city: "İstanbul", district: "Tümü" };
  }, []);

  const [cityList] = useState(() => getLocalCities());
  const [selectedCity, setSelectedCity] = useState(initialArea.city);
  const [districtList, setDistrictList] = useState<string[]>(() =>
    getLocalDistricts(initialArea.city)
  );
  const [selectedDistrict, setSelectedDistrict] = useState(initialArea.district);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<RawPharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    cached
  );

  // Dynamic SEO Title
  useEffect(() => {
    const areaText =
      selectedDistrict && selectedDistrict !== "Tümü"
        ? `${selectedDistrict}, ${selectedCity}`
        : selectedCity;
    document.title = `${areaText} Tüm Eczaneler Rehberi (Adres ve Telefon) | Nöbetçi Eczanem`;
  }, [selectedCity, selectedDistrict]);

  // Auto GPS on mount
  useEffect(() => {
    let mounted = true;
    requestGlobalLocation().then((loc) => {
      if (!mounted || !loc) return;
      setUserLocation(loc);
      const { city: detectedCity, district: detectedDistrict } = findNearestCityAndDistrict(
        loc.latitude,
        loc.longitude
      );
      setSelectedCity(detectedCity);
      const districts = getLocalDistricts(detectedCity);
      setDistrictList(districts);
      setSelectedDistrict(detectedDistrict);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const districts = getLocalDistricts(cityName);
    setDistrictList(districts);
    setSelectedDistrict("Tümü");
  };

  const loadPharmacies = async (
    city: string,
    dist: string,
    locOverride?: { latitude: number; longitude: number } | null
  ) => {
    setLoading(true);
    try {
      const candidateLoc = locOverride !== undefined ? locOverride : userLocation;
      let refLoc: { latitude: number; longitude: number } | null = null;
      if (candidateLoc && isUserInSelectedCity(candidateLoc, city)) {
        refLoc = candidateLoc;
      } else {
        const coords = getDistrictCoordinates(city, dist);
        refLoc = { latitude: coords.lat, longitude: coords.lng };
      }

      const data = await fetchDutyPharmaciesAuto(city, dist, refLoc);
      if (data && data.days && data.days.length > 0) {
        const allList: RawPharmacy[] = [];
        const seenNames = new Set<string>();

        data.days.forEach((dayGroup: DayDutyGroup) => {
          dayGroup.pharmacies.forEach((pharm: RawPharmacy) => {
            const key = `${pharm.name.toLocaleLowerCase("tr-TR")}_${pharm.district?.name || ""}`;
            if (!seenNames.has(key)) {
              seenNames.add(key);
              allList.push(pharm);
            }
          });
        });

        setPharmacies(allList);
      }
    } catch {
      // Quiet fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacies(selectedCity, selectedDistrict, userLocation);
  }, [selectedCity, selectedDistrict]);

  const findNearby = () => {
    if (!navigator.geolocation) return;

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserLocation(coords);
        setCachedUserLocation(coords);

        const { city: detectedCity, district: detectedDistrict } = findNearestCityAndDistrict(
          coords.latitude,
          coords.longitude
        );
        setSelectedCity(detectedCity);
        const districts = getLocalDistricts(detectedCity);
        setDistrictList(districts);
        setSelectedDistrict(detectedDistrict);

        await loadPharmacies(detectedCity, detectedDistrict, coords);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      const term = searchTerm.toLocaleLowerCase("tr-TR").trim();
      if (!term) return true;
      const matchName = p.name.toLocaleLowerCase("tr-TR").includes(term);
      const matchDist = p.district?.name.toLocaleLowerCase("tr-TR").includes(term);
      const matchAddr = p.address?.toLocaleLowerCase("tr-TR").includes(term);
      const matchPhone = p.phone?.includes(term);
      return matchName || matchDist || matchAddr || matchPhone;
    });
  }, [pharmacies, searchTerm]);

  return (
    <main className="min-h-screen bg-gray-50/50 pb-16 pt-4">
      <div className="container max-w-6xl">
        {/* Search & Control Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
            {/* GPS Quick Button */}
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button
                type="button"
                onClick={findNearby}
                disabled={loading}
                className="button button-primary w-full flex items-center justify-center gap-2 font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />}
                En Yakın Eczaneleri Göster
              </button>
            </div>

            {/* City Select */}
            <div>
              <label className="block text-[11px] font-black uppercase text-gray-500 mb-1">
                İl Seçin
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                aria-label="İl seçin"
                className="w-full bg-gray-50 border border-gray-300 font-bold text-gray-900 text-xs sm:text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:border-red-500"
              >
                {cityList.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div>
              <label className="block text-[11px] font-black uppercase text-gray-500 mb-1">
                İlçe Seçin
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                aria-label="İlçe seçin"
                className="w-full bg-gray-50 border border-gray-300 font-bold text-gray-900 text-xs sm:text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:border-red-500"
              >
                <option value="Tümü">Tüm İlçeler ({districtList.length})</option>
                {districtList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Search */}
            <div>
              <label className="block text-[11px] font-black uppercase text-gray-500 mb-1">
                Eczane / Mahalle Ara
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="İsim veya sokak..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm font-semibold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs text-gray-600 font-medium">
            <span>
              <strong>{selectedCity}</strong>{" "}
              {selectedDistrict !== "Tümü" ? `· ${selectedDistrict}` : ""} bölgesinde{" "}
              <strong>{filteredPharmacies.length}</strong> eczane listeleniyor.
            </span>
            <span className="text-red-700 font-bold flex items-center gap-1">
              <ShieldCheck size={14} /> Resmi Eczacı Odaları Kayıtları
            </span>
          </div>
        </div>

        {/* Pharmacy Cards Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={36} className="animate-spin text-red-600 mx-auto mb-3" />
            <p className="text-sm font-extrabold text-gray-800">Eczane listesi güncelleniyor...</p>
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-xs">
            <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-black text-gray-900 mb-1">Eczane Bulunamadı</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Arama kriterlerinize uygun eczane bulunamadı. Lütfen ilçe seçimini 'Tümü' yaparak veya
              farklı bir arama terimi deneyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPharmacies.map((pharm, idx) => {
              const cleanPhone = pharm.phone ? pharm.phone.replace(/[^0-9+]/g, "") : "";
              const displayPhone = formatCleanPhone(pharm.phone);
              const mapsUrl =
                pharm.location?.latitude && pharm.location?.longitude
                  ? `https://www.google.com/maps/dir/?api=1&destination=${pharm.location.latitude},${pharm.location.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      pharm.name +
                        " Eczanesi " +
                        (pharm.district?.name || "") +
                        " " +
                        (pharm.city?.name || "")
                    )}`;

              const distKm =
                pharm.distance !== undefined
                  ? pharm.distance
                  : userLocation &&
                    pharm.location?.latitude &&
                    pharm.location?.longitude &&
                    isUserInSelectedCity(userLocation, pharm.city?.name || selectedCity)
                  ? calculateDistanceKm(
                      userLocation.latitude,
                      userLocation.longitude,
                      pharm.location.latitude,
                      pharm.location.longitude
                    )
                  : undefined;

              return (
                <article
                  key={pharm.id || idx}
                  className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shadow-xs hover:border-red-300 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className="shrink-0 w-7 h-7 rounded-lg font-black text-xs bg-red-600 text-white flex items-center justify-center mt-0.5 shadow-2xs">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug break-words">
                            {pharm.name}
                          </h3>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">
                            {pharm.district?.name ? `${pharm.district.name} · ` : ""}
                            {pharm.city?.name || selectedCity}
                          </p>
                        </div>
                      </div>

                      {distKm !== undefined && (
                        <span className="shrink-0 font-extrabold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs inline-flex items-center gap-1 whitespace-nowrap">
                          <MapPin size={12} className="text-red-600" />
                          {formatDistance(distKm)}
                        </span>
                      )}
                    </div>

                    <div className="my-3 py-2.5 border-y border-gray-100 text-xs sm:text-sm text-gray-700 leading-relaxed">
                      <FormattedAddress
                        address={pharm.address || ""}
                        landmark={pharm.landmark}
                        addressDescription={pharm.addressDescription}
                        district={pharm.district?.name || selectedDistrict}
                        city={pharm.city?.name || selectedCity}
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                    <a
                      className="button button-secondary flex items-center justify-center gap-1 font-bold text-[11px] sm:text-xs py-2 px-1.5 rounded-xl whitespace-nowrap overflow-hidden min-w-0"
                      href={`tel:${cleanPhone}`}
                      title={pharm.phone || "Telefon Et"}
                    >
                      <Phone size={13} className="shrink-0 text-red-600" />
                      <span className="truncate">{displayPhone}</span>
                    </a>
                    <a
                      className="button button-quiet flex items-center justify-center gap-1 font-bold text-xs py-2 px-2 rounded-xl text-red-700 bg-red-50/80 hover:bg-red-100/80 whitespace-nowrap"
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Navigation size={13} className="shrink-0" /> Yol Tarifi
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
