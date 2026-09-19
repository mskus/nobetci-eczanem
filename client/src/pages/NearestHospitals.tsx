import { useState, useMemo, useEffect, useRef } from "react";
import {
  Building2,
  Compass,
  MapPin,
  Phone,
  Navigation,
  Search,
  ShieldCheck,
  Clock3,
  Stethoscope,
  HeartPulse,
  Syringe,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Flame,
  Layers,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  HealthFacility,
  FacilityType,
  FACILITY_TYPE_LABELS,
  getFacilitiesByCity,
} from "@/lib/healthFacilityData";
import { getLocalCities, getLocalDistricts } from "@/lib/pharmacyService";
import {
  TURKEY_CITY_COORDINATES,
  TURKEY_DISTRICT_COORDINATES,
  calculateDistanceKm,
  formatDistance,
} from "@/lib/turkeyGeoData";
import { toTurkishSlug } from "@shared/turkeyDistricts";
import { toast } from "sonner";

// Leaflet Map Component for Hospitals & Clinics
function HospitalLeafletMap({
  facilities,
  selectedFacilityIndex,
  userLocation,
  onSelect,
  areaTitle,
}: {
  facilities: HealthFacility[];
  selectedFacilityIndex: number;
  userLocation: { latitude: number; longitude: number } | null;
  onSelect: (index: number) => void;
  areaTitle: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([39.0, 35.0], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
    }

    const map = mapInstance.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add user GPS marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `<div style="width:20px;height:20px;background:#2563eb;border:3px solid #ffffff;border-radius:50%;box-shadow:0 0 10px rgba(37,99,235,0.8);animation:pulse 2s infinite;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
      userMarker.bindPopup("<strong>Sizin Konumunuz</strong>");
      markersRef.current.push(userMarker);
    }

    // Add facility markers
    if (facilities.length > 0) {
      const bounds = L.latLngBounds([]);

      facilities.forEach((fac, idx) => {
        const isSelected = idx === selectedFacilityIndex;
        const color = fac.type === "hastane" ? "#dc2626" : fac.type === "saglik_ocagi" ? "#059669" : "#2563eb";
        const badgeText = fac.type === "hastane" ? "H" : fac.type === "saglik_ocagi" ? "ASM" : "SK";

        const icon = L.divIcon({
          className: "custom-facility-marker",
          html: `<div style="
            background: ${isSelected ? "#111827" : color};
            color: #ffffff;
            font-weight: 900;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 12px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            transform: scale(${isSelected ? 1.15 : 1});
            transition: all 0.2s;
          ">
            <span style="background:rgba(255,255,255,0.25);padding:1px 4px;border-radius:4px;font-size:9px;">${badgeText}</span>
            <span>${fac.name.replace(/Hastanesi|Sağlık Ocağı|Aile Sağlığı Merkezi|Sağlık Kabini/gi, "").trim()}</span>
          </div>`,
          iconSize: [120, 32],
          iconAnchor: [60, 16],
        });

        const marker = L.marker([fac.location.latitude, fac.location.longitude], { icon }).addTo(map);

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.location.latitude},${fac.location.longitude}`;
        const popupContent = `
          <div style="font-family:sans-serif;padding:4px;min-width:180px;">
            <span style="font-size:9px;font-weight:900;text-transform:uppercase;color:${color};">${fac.typeName}</span>
            <strong style="display:block;font-size:13px;margin:2px 0;color:#111827;">${fac.name}</strong>
            <p style="font-size:11px;color:#4b5563;margin:0 0 6px 0;">${fac.address}</p>
            <div style="display:flex;gap:4px;">
              <a href="tel:${fac.phone.replace(/[^0-9+]/g, "")}" style="flex:1;text-align:center;background:#f3f4f6;color:#111827;padding:5px;border-radius:6px;font-size:11px;font-weight:bold;text-decoration:none;">Ara: ${fac.phone}</a>
              <a href="${mapsUrl}" target="_blank" style="flex:1;text-align:center;background:#dc2626;color:#ffffff;padding:5px;border-radius:6px;font-size:11px;font-weight:bold;text-decoration:none;">Yol Tarifi</a>
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

      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [facilities, selectedFacilityIndex, userLocation]);

  return (
    <div className="relative w-full h-72 sm:h-96">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-black text-gray-800 flex items-center gap-1.5">
        <MapPin size={14} className="text-red-600" />
        <span>{areaTitle} Sağlık Haritası</span>
        <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-mono">
          {facilities.length} Tesis
        </span>
      </div>
    </div>
  );
}

export default function NearestHospitals() {
  const [cityList] = useState(() => getLocalCities());
  const [selectedCity, setSelectedCity] = useState("İstanbul");
  const [districtList, setDistrictList] = useState<string[]>(() => getLocalDistricts("İstanbul"));
  const [selectedDistrict, setSelectedDistrict] = useState("Tümü");
  const [selectedType, setSelectedType] = useState<FacilityType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedFacilityIdx, setSelectedFacilityIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  // Dynamic Center location when GPS is not enabled (relative to selected district/city center)
  const effectiveReferenceLocation = useMemo(() => {
    if (userLocation) return userLocation;
    const cSlug = toTurkishSlug(selectedCity);
    const dSlug = toTurkishSlug(selectedDistrict);
    if (selectedDistrict !== "Tümü" && TURKEY_DISTRICT_COORDINATES[cSlug]?.[dSlug]) {
      const dCoords = TURKEY_DISTRICT_COORDINATES[cSlug][dSlug];
      return { latitude: dCoords.lat, longitude: dCoords.lng };
    }
    const cCoords = TURKEY_CITY_COORDINATES[cSlug] || { lat: 41.0082, lng: 28.9784 };
    return { latitude: cCoords.lat, longitude: cCoords.lng };
  }, [userLocation, selectedCity, selectedDistrict]);

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    const dists = getLocalDistricts(newCity);
    setDistrictList(dists);
    setSelectedDistrict("Tümü");
  };

  const findNearby = () => {
    if (!navigator.geolocation) {
      toast.error("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserLocation(loc);
        setLoading(false);
        toast.success("GPS Konumunuz alındı! En yakın sağlık kuruluşları sıralandı.");
      },
      (err) => {
        setLoading(false);
        toast.error("Konum izni alınamadı. Şehir ve ilçe seçerek listeleyebilirsiniz.");
      },
      { timeout: 8000 }
    );
  };

  const facilities = useMemo(() => {
    return getFacilitiesByCity(selectedCity, selectedDistrict, selectedType, effectiveReferenceLocation);
  }, [selectedCity, selectedDistrict, selectedType, effectiveReferenceLocation]);

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

  return (
    <main className="pb-16 bg-gray-50/50 min-h-screen">
      
      {/* 7/24 Acil Çağrı Üst Bandı */}
      <section className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white py-3 px-4 shadow-md sticky top-16 z-20">
        <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping" />
            <strong className="text-xs sm:text-sm font-black">
              Acil Tıbbi Müdahale İçin 7/24 Kesintisiz Hatlar:
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:112"
              className="bg-white text-red-700 hover:bg-red-50 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
            >
              <Phone size={14} className="fill-red-700" />
              <span>112 ACİL ARA</span>
            </a>
            <a
              href="tel:182"
              className="bg-red-900/70 hover:bg-red-900 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 border border-red-400/40"
            >
              <Clock3 size={13} />
              <span>182 Randevu</span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container max-w-6xl mx-auto px-4">
          
          {/* Kategori Seçim Sekmeleri */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedType === "all"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Building2 size={16} />
              <span>Tüm Tesisler ({facilities.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("hastane")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedType === "hastane"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <HeartPulse size={16} />
              <span>Hastaneler (7/24 Acil)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("saglik_ocagi")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedType === "saglik_ocagi"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Stethoscope size={16} />
              <span>Sağlık Ocakları (ASM)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("saglik_kabini")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedType === "saglik_kabini"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Syringe size={16} />
              <span>Sağlık Kabinleri & İğne</span>
            </button>
          </div>

          {/* Filtre ve Arama Paneli */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* GPS Konum Butonu */}
              <div className="sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={findNearby}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />}
                  En Yakını Bul (GPS)
                </button>
              </div>

              {/* İl Seçimi */}
              <div>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 font-bold text-gray-900 text-xs sm:text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:border-red-500"
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
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
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

              {/* İsim Arama */}
              <div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Hastane veya hizmet ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm font-semibold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-gray-100 text-xs text-gray-600 font-medium">
              <span>
                <strong>{selectedCity}</strong> {selectedDistrict !== "Tümü" ? `· ${selectedDistrict}` : ""} bölgesinde <strong>{filteredFacilities.length}</strong> tesis listeleniyor.
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} />
                {userLocation ? "Mesafeler GPS konumunuza göre hesaplandı" : `Mesafeler ${selectedDistrict !== "Tümü" ? selectedDistrict : selectedCity} merkezine göre hesaplandı`}
              </span>
            </div>
          </div>

          {/* İnteraktif Harita - Hastaneler, ASM ve Kabinler */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md mb-6 bg-white">
            <HospitalLeafletMap
              facilities={filteredFacilities}
              selectedFacilityIndex={selectedFacilityIdx}
              userLocation={userLocation}
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
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-xs">
              <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-black text-gray-900 mb-1">Kayıt Bulunamadı</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Arama kriterlerinize uygun sağlık kuruluşu bulunamadı. Lütfen ilçe seçimini 'Tümü' yaparak veya arama terimini değiştirerek tekrar deneyin.
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
                        ? "border-red-500 shadow-md ring-2 ring-red-500/10"
                        : "border-gray-200 shadow-xs hover:border-gray-300"
                    }`}
                  >
                    <div>
                      {/* Üst Kategori ve Mesafe Rozeti */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${typeMeta.color}`}>
                          {fac.typeName}
                        </span>

                        {fac.distance !== undefined && (
                          <span className="shrink-0 font-extrabold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs inline-flex items-center gap-1 whitespace-nowrap">
                            <MapPin size={12} className="text-red-600" />
                            {formatDistance(fac.distance)}
                          </span>
                        )}
                      </div>

                      {/* Başlık */}
                      <h3 className="text-base font-black text-gray-900 leading-snug">
                        {fac.name}
                      </h3>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">
                        {fac.district} · {fac.city}
                      </p>

                      {/* Açık Adres ve Sarı Tarif Kutusu */}
                      <div className="my-2.5 py-2 border-y border-gray-100 text-xs space-y-1.5">
                        <div className="flex items-start gap-1.5">
                          <MapPin size={13} className="text-red-600 shrink-0 mt-0.5" />
                          <p className="text-xs font-bold text-gray-800 leading-snug">
                            {fac.address}
                          </p>
                        </div>

                        {fac.landmark && (
                          <div className="pl-4">
                            <div className="flex items-start gap-1.5 p-1.5 px-2 rounded-lg bg-amber-50/95 border border-amber-300/90 text-amber-950 shadow-2xs">
                              <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-200/90 px-1 py-0.2 rounded shrink-0">
                                TARİF
                              </span>
                              <p className="text-[11px] font-extrabold leading-tight flex-1 text-amber-950">
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
                              className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="mt-auto pt-2 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                      <a
                        className="button button-secondary flex items-center justify-center gap-1 font-bold text-xs py-2 px-1.5 rounded-xl whitespace-nowrap overflow-hidden"
                        href={`tel:${cleanPhone}`}
                        title={fac.phone}
                      >
                        <Phone size={13} className="shrink-0" />
                        <span className="truncate">{fac.phone}</span>
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
      </section>
    </main>
  );
}
