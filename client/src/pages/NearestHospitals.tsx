import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Building2,
  Compass,
  MapPin,
  Phone,
  Navigation,
  Search,
  Clock3,
  Stethoscope,
  HeartPulse,
  Syringe,
  CheckCircle2,
  Loader2,
  Share2,
  Maximize2,
  Minimize2,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import {
  HealthFacility,
  FacilityType,
  FACILITY_TYPE_LABELS,
  getFacilitiesByCity,
} from "@/lib/healthFacilityData";
import { getNearbyHospitals } from "@/lib/nearbyHospitals";
import { getLocalCities, getLocalDistricts } from "@/lib/pharmacyService";
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

const QUICK_CITIES = [
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

function HospitalLeafletMap({
  facilities,
  selectedFacilityIndex,
  userLocation,
  onSelect,
  areaTitle,
  expanded,
  onToggleExpand,
}: {
  facilities: HealthFacility[];
  selectedFacilityIndex: number;
  userLocation: { latitude: number; longitude: number } | null;
  onSelect: (index: number) => void;
  areaTitle: string;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const prevFacilitiesSigRef = useRef<string>("");

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    if (!mapInstance.current) {
      const map = L.map(container, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([39.9208, 32.8541], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
    }

    const resizeObserver = new ResizeObserver(() => {
      mapInstance.current?.invalidateSize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (userLocation) {
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `<div style="width:20px;height:20px;background:#2563eb;border:3px solid #ffffff;border-radius:50%;box-shadow:0 0 10px rgba(37,99,235,0.8);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
      userMarker.bindPopup("<strong>📍 Sizin Konumunuz</strong>");
      markersRef.current.push(userMarker);
    }

    if (facilities.length > 0) {
      const bounds = L.latLngBounds([]);

      facilities.forEach((fac, idx) => {
        const isSelected = idx === selectedFacilityIndex;
        const color =
          fac.type === "hastane"
            ? "#dc2626"
            : fac.type === "saglik_ocagi"
            ? "#059669"
            : "#2563eb";
        const badgeText =
          fac.type === "hastane" ? "H" : fac.type === "saglik_ocagi" ? "ASM" : "SK";

        const icon = L.divIcon({
          className: "custom-facility-marker",
          html: `<div style="
            background: ${isSelected ? "#111827" : color};
            color: #ffffff;
            font-weight: 900;
            font-size: 11px;
            padding: 3px 7px;
            border-radius: 999px;
            border: 2px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.32);
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            transform: scale(${isSelected ? 1.15 : 1});
            transition: all 0.2s;
          ">
            <span>#${idx + 1}</span>
            <span style="opacity:0.88;font-size:9px;">${badgeText}</span>
          </div>`,
          iconSize: [54, 26],
          iconAnchor: [27, 13],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([fac.location.latitude, fac.location.longitude], {
          icon,
          zIndexOffset: isSelected ? 800 : 100,
        }).addTo(map);

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.location.latitude},${fac.location.longitude}`;
        const popupContent = `
          <div style="font-family:sans-serif;padding:4px;min-width:185px;">
            <span style="font-size:9px;font-weight:900;text-transform:uppercase;color:${color};">#${idx + 1} · ${fac.typeName}</span>
            <strong style="display:block;font-size:13px;margin:2px 0;color:#111827;">${fac.name}</strong>
            <p style="font-size:11px;color:#4b5563;margin:0 0 6px 0;">${fac.address}</p>
            <div style="display:flex;gap:4px;">
              <a href="tel:${fac.phone.replace(/[^0-9+]/g, "")}" style="flex:1;text-align:center;background:#f3f4f6;color:#111827;padding:5px;border-radius:6px;font-size:11px;font-weight:bold;text-decoration:none;">Ara</a>
              <a href="${mapsUrl}" target="_blank" rel="noreferrer" style="flex:1;text-align:center;background:#dc2626;color:#ffffff;padding:5px;border-radius:6px;font-size:11px;font-weight:bold;text-decoration:none;">Yol Tarifi</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on("click", () => {
          onSelect(idx);
        });

        markersRef.current.push(marker);
        bounds.extend([fac.location.latitude, fac.location.longitude]);
      });

      if (userLocation && facilities[0]) {
        const distToUser = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          facilities[0].location.latitude,
          facilities[0].location.longitude
        );
        if (distToUser <= 85) {
          bounds.extend([userLocation.latitude, userLocation.longitude]);
        }
      }

      const currentSig = facilities.map((f) => f.id).join("|");
      const listChanged = currentSig !== prevFacilitiesSigRef.current;
      prevFacilitiesSigRef.current = currentSig;

      if (listChanged) {
        if (bounds.isValid()) {
          map.invalidateSize();
          map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
        }
      } else {
        const selectedFac = facilities[selectedFacilityIndex];
        if (selectedFac) {
          map.setView(
            [selectedFac.location.latitude, selectedFac.location.longitude],
            Math.max(map.getZoom(), 14),
            { animate: true }
          );
          const markerOffset = userLocation ? selectedFacilityIndex + 1 : selectedFacilityIndex;
          markersRef.current[markerOffset]?.openPopup();
        }
      }
    }
  }, [facilities, selectedFacilityIndex, userLocation, onSelect, expanded]);

  return (
    <div
      className={`relative w-full transition-all duration-300 ${
        expanded ? "h-88 sm:h-[460px]" : "h-52 sm:h-80"
      }`}
    >
      <div ref={mapRef} className="w-full h-full relative z-0" />
      <div className="absolute top-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-black text-gray-800 flex items-center gap-1.5 pointer-events-none">
        <MapPin size={14} className="text-red-600 shrink-0" />
        <span className="truncate max-w-[160px] sm:max-w-xs">{areaTitle} Sağlık Haritası</span>
        <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-mono shrink-0">
          {facilities.length} Tesis
        </span>
      </div>
      <button
        type="button"
        onClick={onToggleExpand}
        className="absolute bottom-2.5 right-2.5 z-[400] bg-white/95 hover:bg-white text-gray-900 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-gray-300 shadow-md flex items-center gap-1.5 cursor-pointer"
      >
        {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        <span>{expanded ? "Haritayı Küçült" : "Haritayı Büyüt"}</span>
      </button>
    </div>
  );
}

export default function NearestHospitals() {
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
  const [selectedType, setSelectedType] = useState<FacilityType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    cached
  );
  const [selectedFacilityIdx, setSelectedFacilityIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [osmFacilities, setOsmFacilities] = useState<HealthFacility[]>([]);

  // Dynamic SEO Title
  useEffect(() => {
    const areaText =
      selectedDistrict && selectedDistrict !== "Tümü"
        ? `${selectedDistrict}, ${selectedCity}`
        : selectedCity;
    document.title = `${areaText} En Yakın Hastane, 7/24 Acil Servis ve Sağlık Ocağı (ASM) | Nöbetçi Eczanem`;
  }, [selectedCity, selectedDistrict]);

  // Dynamic Center location: only use userLocation if user is inside/near selectedCity
  const effectiveReferenceLocation = useMemo(() => {
    if (userLocation && isUserInSelectedCity(userLocation, selectedCity)) {
      return userLocation;
    }
    const coords = getDistrictCoordinates(selectedCity, selectedDistrict);
    return { latitude: coords.lat, longitude: coords.lng };
  }, [userLocation, selectedCity, selectedDistrict]);

  // Auto GPS on mount without requiring button click
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
      const dists = getLocalDistricts(detectedCity);
      setDistrictList(dists);
      setSelectedDistrict(detectedDistrict);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Also fetch live OpenStreetMap hospitals near the effective reference location
  useEffect(() => {
    const controller = new AbortController();
    getNearbyHospitals(
      effectiveReferenceLocation.latitude,
      effectiveReferenceLocation.longitude,
      controller.signal
    )
      .then((liveList) => {
        setOsmFacilities(liveList);
      })
      .catch(() => {
        setOsmFacilities([]);
      });
    return () => controller.abort();
  }, [effectiveReferenceLocation.latitude, effectiveReferenceLocation.longitude]);

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    const dists = getLocalDistricts(newCity);
    setDistrictList(dists);
    setSelectedDistrict("Tümü");
    setSelectedFacilityIdx(0);
  };

  const findNearby = () => {
    if (!navigator.geolocation) return;

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserLocation(loc);
        setCachedUserLocation(loc);
        const { city: detectedCity, district: detectedDistrict } = findNearestCityAndDistrict(
          loc.latitude,
          loc.longitude
        );
        setSelectedCity(detectedCity);
        const dists = getLocalDistricts(detectedCity);
        setDistrictList(dists);
        setSelectedDistrict(detectedDistrict);
        setSelectedFacilityIdx(0);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Merge verified facilities with live OSM facilities (deduplicated & sorted by distance)
  const facilities = useMemo(() => {
    const baseList = getFacilitiesByCity(
      selectedCity,
      selectedDistrict,
      selectedType,
      effectiveReferenceLocation
    );

    const seenNames = new Set(baseList.map((f) => f.name.toLocaleLowerCase("tr-TR")));
    const merged = [...baseList];

    osmFacilities.forEach((osmFac) => {
      if (selectedType !== "all" && osmFac.type !== selectedType) return;
      if (
        selectedDistrict !== "Tümü" &&
        osmFac.district &&
        osmFac.district.toLocaleLowerCase("tr-TR") !== selectedDistrict.toLocaleLowerCase("tr-TR")
      ) {
        return;
      }
      const normName = osmFac.name.toLocaleLowerCase("tr-TR");
      if (!seenNames.has(normName)) {
        seenNames.add(normName);
        const dist = calculateDistanceKm(
          effectiveReferenceLocation.latitude,
          effectiveReferenceLocation.longitude,
          osmFac.location.latitude,
          osmFac.location.longitude
        );
        if (dist <= 35) {
          merged.push({
            ...osmFac,
            city: osmFac.city || selectedCity,
            district:
              osmFac.district || (selectedDistrict !== "Tümü" ? selectedDistrict : "Merkez"),
            distance: Number(dist.toFixed(2)),
          });
        }
      }
    });

    merged.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    return merged;
  }, [selectedCity, selectedDistrict, selectedType, effectiveReferenceLocation, osmFacilities]);

  const filteredFacilities = useMemo(() => {
    if (!searchTerm.trim()) return facilities;
    const q = searchTerm.toLocaleLowerCase("tr-TR");
    return facilities.filter(
      (f) =>
        f.name.toLocaleLowerCase("tr-TR").includes(q) ||
        f.address.toLocaleLowerCase("tr-TR").includes(q) ||
        f.district.toLocaleLowerCase("tr-TR").includes(q) ||
        f.services.some((s) => s.toLocaleLowerCase("tr-TR").includes(q))
    );
  }, [facilities, searchTerm]);

  const shareFacility = (fac: HealthFacility) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.location.latitude},${fac.location.longitude}`;
    const shareText = `${fac.name} (${fac.typeName})\nAdres: ${fac.address}\nTel: ${fac.phone}\nKonum: ${mapsUrl}`;
    if (navigator.share) {
      navigator.share({ title: fac.name, text: shareText, url: mapsUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
      toast.success("Hastane adres ve konum bilgisi kopyalandı!");
    }
  };

  const userIsInCity = isUserInSelectedCity(userLocation, selectedCity);

  return (
    <main className="pb-16 bg-slate-50 min-h-screen">
      {/* 7/24 Acil Çağrı Üst Bandı — Statik ve Mobil Dostu */}
      <section className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white py-2.5 px-3 sm:px-4 shadow-xs border-b border-red-800">
        <div className="container max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping shrink-0" />
            <strong className="text-xs sm:text-sm font-black">
              7/24 Acil Sağlık & Randevu Hatları:
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:112"
              className="bg-white text-red-700 hover:bg-red-50 font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Phone size={13} className="fill-red-700" />
              <span>112 ACİL</span>
            </a>
            <a
              href="tel:182"
              className="bg-red-900/70 hover:bg-red-900 text-white font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-red-400/40"
            >
              <Clock3 size={13} />
              <span>182 MHRS</span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-3 sm:py-5">
        <div className="container max-w-6xl mx-auto px-3 sm:px-4">
          {/* Mobil Tek Dokunuşla Hızlı Şehir Seçim Çubuğu */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 mb-2">
            <button
              type="button"
              onClick={findNearby}
              className="shrink-0 h-9 px-3 rounded-xl bg-red-600 text-white font-black text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <Compass size={14} />
              <span>Konumum</span>
            </button>
            {QUICK_CITIES.map((cName) => {
              const active = selectedCity === cName;
              return (
                <button
                  key={cName}
                  type="button"
                  onClick={() => handleCityChange(cName)}
                  className={`shrink-0 h-9 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-red-300"
                  }`}
                >
                  {cName}
                </button>
              );
            })}
          </div>

          {/* Kategori Seçim Sekmeleri - Mobil Kaydırılabilir */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => {
                setSelectedType("all");
                setSelectedFacilityIdx(0);
              }}
              className={`min-h-11 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedType === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Building2 size={15} className="shrink-0" />
              <span className="truncate">Tümü ({facilities.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType("hastane");
                setSelectedFacilityIdx(0);
              }}
              className={`min-h-11 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedType === "hastane"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <HeartPulse size={15} className="shrink-0" />
              <span className="truncate">Hastaneler (Acil)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType("saglik_ocagi");
                setSelectedFacilityIdx(0);
              }}
              className={`min-h-11 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedType === "saglik_ocagi"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Stethoscope size={15} className="shrink-0" />
              <span className="truncate">Sağlık Ocağı (ASM)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType("saglik_kabini");
                setSelectedFacilityIdx(0);
              }}
              className={`min-h-11 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedType === "saglik_kabini"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Syringe size={15} className="shrink-0" />
              <span className="truncate">Sağlık Kabinleri</span>
            </button>
          </div>

          {/* Filtre ve Arama Paneli - Mobil Kolay Seçim */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {/* İl Seçimi */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase mb-1">
                  1. Şehir (İl)
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  aria-label="Şehir seçin"
                  className="w-full h-11 bg-slate-50 border-2 border-slate-300 font-bold text-slate-900 text-sm rounded-xl px-2.5 focus:outline-none focus:border-red-600"
                >
                  {cityList.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* İlçe Seçimi */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase mb-1">
                  2. İlçe
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedFacilityIdx(0);
                  }}
                  aria-label="İlçe seçin"
                  className="w-full h-11 bg-slate-50 border-2 border-slate-300 font-bold text-slate-900 text-sm rounded-xl px-2.5 focus:outline-none focus:border-red-600"
                >
                  <option value="Tümü">Tüm İlçeler ({districtList.length})</option>
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* İsim Arama */}
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-[11px] font-black text-slate-600 uppercase mb-1">
                  3. Hastane / Poliklinik Ara
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Hastane, ASM veya bölüm yazın..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 text-sm font-semibold border-2 border-slate-300 rounded-xl focus:outline-none focus:border-red-600 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* GPS Konum Butonu */}
              <div className="col-span-2 lg:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={findNearby}
                  disabled={loading}
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Compass size={16} />
                  )}
                  <span>En Yakın Hastaneyi Göster</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <span>
                <strong>{selectedCity}</strong>{" "}
                {selectedDistrict !== "Tümü" ? `· ${selectedDistrict}` : "· Tüm İlçeler"} için{" "}
                <strong>{filteredFacilities.length}</strong> sağlık kuruluşu sıralandı.
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} />
                {userIsInCity
                  ? "Canlı GPS konumunuza göre en yakından uzağa"
                  : `${
                      selectedDistrict !== "Tümü" ? selectedDistrict : selectedCity
                    } merkezine göre en yakından uzağa`}
              </span>
            </div>
          </div>

          {/* İnteraktif Harita - Hastaneler, ASM ve Kabinler */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md mb-5 bg-white relative z-0">
            <HospitalLeafletMap
              facilities={filteredFacilities}
              selectedFacilityIndex={selectedFacilityIdx}
              userLocation={userLocation}
              expanded={mapExpanded}
              onToggleExpand={() => setMapExpanded((prev) => !prev)}
              onSelect={(idx) => {
                setSelectedFacilityIdx(idx);
                const el = document.getElementById(`fac-card-${idx}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              areaTitle={`${selectedCity} ${selectedDistrict !== "Tümü" ? selectedDistrict : ""}`}
            />
          </div>

          {/* Sağlık Kuruluşları Kart Listesi */}
          {filteredFacilities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
              <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-900 mb-1">Kayıt Bulunamadı</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Arama kriterlerinize uygun sağlık kuruluşu bulunamadı. İlçe seçimini 'Tümü' yaparak
                veya arama kutusunu temizleyerek tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.map((fac, fIdx) => {
                const isSelected = selectedFacilityIdx === fIdx;
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.location.latitude},${fac.location.longitude}`;
                const cleanPhone = fac.phone.replace(/[^0-9+]/g, "");
                const typeMeta = FACILITY_TYPE_LABELS[fac.type];

                return (
                  <article
                    key={fac.id}
                    id={`fac-card-${fIdx}`}
                    onClick={() => setSelectedFacilityIdx(fIdx)}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-red-600 shadow-md ring-2 ring-red-500/20"
                        : "border-slate-200 shadow-xs hover:border-red-300"
                    }`}
                  >
                    <div>
                      {/* Üst Kategori ve Mesafe Rozeti */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${typeMeta.color}`}
                        >
                          {fac.typeName}
                        </span>

                        {fac.distance !== undefined && (
                          <span className="shrink-0 font-extrabold bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1 whitespace-nowrap">
                            <MapPin size={12} className="text-red-600" />
                            {formatDistance(fac.distance)}
                          </span>
                        )}
                      </div>

                      {/* Numaralandırılmış Başlık */}
                      <div className="flex items-start gap-2.5">
                        <span className="shrink-0 w-7 h-7 rounded-lg font-black text-xs bg-red-600 text-white flex items-center justify-center mt-0.5 shadow-2xs">
                          #{fIdx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-black text-slate-900 leading-snug break-words">
                            {fac.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            {fac.district} · {fac.city}
                          </p>
                        </div>
                      </div>

                      {/* Açık Adres ve Sarı Tarif Kutusu */}
                      <div className="my-3 py-2.5 border-y border-slate-100 text-xs space-y-2">
                        <div className="flex items-start gap-1.5">
                          <MapPin size={14} className="text-red-600 shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug break-words">
                            {fac.address}
                          </p>
                        </div>

                        {fac.landmark && (
                          <div className="pl-4">
                            <div className="flex items-start gap-1.5 p-1.5 px-2.5 rounded-lg bg-amber-50/95 border border-amber-300/90 text-amber-950 shadow-2xs">
                              <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-200/90 px-1.5 py-0.2 rounded shrink-0">
                                TARİF
                              </span>
                              <p className="text-[11px] font-extrabold leading-tight flex-1 text-amber-950 break-words">
                                {fac.landmark}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Verilen Hizmetler */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {fac.services.map((srv, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mobil Dostu Büyük Aksiyon Butonları */}
                    <div
                      className="mt-auto pt-2 flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        className="flex-1 min-h-11 button button-secondary flex items-center justify-center gap-1.5 font-extrabold text-xs py-2.5 px-2 rounded-xl whitespace-nowrap overflow-hidden min-w-0"
                        href={`tel:${cleanPhone}`}
                        title={`Ara: ${fac.phone}`}
                      >
                        <Phone size={14} className="shrink-0 text-red-600" />
                        <span className="truncate">{fac.phone}</span>
                      </a>
                      <a
                        className="flex-1 min-h-11 button button-primary flex items-center justify-center gap-1.5 font-extrabold text-xs py-2.5 px-2 rounded-xl whitespace-nowrap"
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Navigation size={14} className="shrink-0" />
                        <span>Yol Tarifi</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => shareFacility(fac)}
                        className="min-h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                        title="Konumu ve Adresi Paylaş"
                        aria-label="Paylaş"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* SEO Bilgilendirme & Acil Servis Rehberi (Google, Yandex, Bing) */}
          <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">
                ACİL SAĞLIK REHBERİ & HASTANE BİLGİ SİSTEMİ
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                En Yakın Hastane, 7/24 Acil Servis ve Aile Sağlığı Merkezi (ASM) Sorgulama
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Türkiye genelinde 81 il ve 973 ilçede Sağlık Bakanlığı'na bağlı Şehir Hastaneleri,
                Eğitim ve Araştırma Hastaneleri, Devlet Hastaneleri, Üniversite Hastaneleri, Aile
                Sağlığı Merkezleri (Sağlık Ocakları) ve nöbetçi sağlık kabinlerinin güncel adres,
                telefon ve harita yol tarifi bilgilerine anında ulaşabilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-red-50/60 border border-red-100">
                <h3 className="text-sm font-black text-red-900 flex items-center gap-1.5 mb-1.5">
                  <HeartPulse size={16} className="text-red-600" />
                  Acil Servis Triyaj (Yeşil, Sarı, Kırmızı Alan)
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Devlet ve şehir hastanelerinin acil servisleri 7/24 ücretsiz hizmet verir. Hayati
                  tehlike içeren durumlar <strong>Kırmızı Alan</strong>'da, orta aciliyetli vakalar{" "}
                  <strong>Sarı Alan</strong>'da, ayaktan hafif başvurular ise{" "}
                  <strong>Yeşil Alan</strong>'da değerlendirilir.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <h3 className="text-sm font-black text-emerald-900 flex items-center gap-1.5 mb-1.5">
                  <Stethoscope size={16} className="text-emerald-600" />
                  Aile Sağlığı Merkezleri (Sağlık Ocağı) Saatleri
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Aile Sağlığı Merkezleri (ASM) hafta içi her gün <strong>08:00 - 17:00</strong>{" "}
                  saatleri arasında hizmet verir. Muayene, kan tahlili, bebek/çocuk aşıları ve
                  raporlu ilaç yazdırma işlemleri tamamen ücretsizdir.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                <h3 className="text-sm font-black text-blue-900 flex items-center gap-1.5 mb-1.5">
                  <Syringe size={16} className="text-blue-600" />
                  Ruhsatlı Sağlık Kabinleri & Evde Bakım
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Hekim tarafından reçete edilmiş enjeksiyon (iğne), serum takma, yara pansumanı,
                  dikiş alma ve sonda değişimi işlemleri için İl Sağlık Müdürlüğü ruhsatlı sağlık
                  kabinlerinden destek alabilirsiniz.
                </p>
              </div>
            </div>

            {/* İç Bağlantılar (SEO Internal Linking) */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-extrabold flex items-center gap-1"
                >
                  <span>81 İl Nöbetçi Eczaneler</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/sgk-katki-payi-hesaplayici"
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-extrabold flex items-center gap-1"
                >
                  <span>SGK Muayene & İlaç Katkı Payı Hesapla</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/ilk-yardim"
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-extrabold flex items-center gap-1"
                >
                  <span>7/24 Acil İlk Yardım Rehberi</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/blog"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-extrabold flex items-center gap-1"
                >
                  <span>İlaç Fiyatları & MHRS Randevu Kılavuzu</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
