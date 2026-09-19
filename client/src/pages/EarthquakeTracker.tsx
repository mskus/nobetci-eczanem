import { useEffect, useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Radio,
  RefreshCw,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { RealLeafletMap } from "@/components/RealLeafletMap";
import { calculateDistanceKm, formatDistance } from "@/lib/turkeyGeoData";

export interface AFADEarthquakeEvent {
  eventID: string;
  location: string;
  latitude: string;
  longitude: string;
  depth: string;
  type: string;
  magnitude: string;
  date: string;
  province?: string;
  district?: string;
  distanceKm?: number;
}

export default function EarthquakeTracker() {
  const [events, setEvents] = useState<AFADEarthquakeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("AFAD Canlı API");
  const [minMag, setMinMag] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"date" | "mag" | "dist">("date");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Alarm settings state
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmMinMag, setAlarmMinMag] = useState<number>(4.0);
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  // Fetch AFAD earthquakes
  const fetchEarthquakes = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDateStr = "";
      
      if (timeRange === "24h") {
        const d = new Date(now.getTime() - 24 * 3600000);
        startDateStr = d.toISOString().replace("T", " ").substring(0, 19);
      } else if (timeRange === "7d") {
        const d = new Date(now.getTime() - 7 * 24 * 3600000);
        startDateStr = d.toISOString().replace("T", " ").substring(0, 19);
      } else {
        const d = new Date(now.getTime() - 30 * 24 * 3600000);
        startDateStr = d.toISOString().replace("T", " ").substring(0, 19);
      }

      const endStr = now.toISOString().replace("T", " ").substring(0, 19);
      const query = new URLSearchParams({
        start: startDateStr,
        end: endStr,
      });

      const res = await fetch(`/api/afad/earthquakes?${query.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setEvents(json.data);
        if (json.source) setSource(json.source);
      } else {
        toast.error("Deprem verileri alınamadı.");
      }
    } catch (e) {
      toast.error("AFAD servisine erişilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarthquakes();
  }, [timeRange]);

  // Request GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  // Process & Filter events with calculated distance
  const processedEvents = useMemo(() => {
    let list = events.map((ev) => {
      const lat = parseFloat(ev.latitude);
      const lng = parseFloat(ev.longitude);
      let dist = ev.distanceKm;

      if (!dist && userLocation && !isNaN(lat) && !isNaN(lng)) {
        dist = calculateDistanceKm(userLocation.latitude, userLocation.longitude, lat, lng);
      }

      return {
        ...ev,
        distanceKm: dist,
        magNum: parseFloat(ev.magnitude) || 0,
      };
    });

    // Filter by min mag
    if (minMag > 0) {
      list = list.filter((e) => e.magNum >= minMag);
    }

    // Sort
    if (sortBy === "mag") {
      list.sort((a, b) => b.magNum - a.magNum);
    } else if (sortBy === "dist") {
      list.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
    } else {
      // date
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return list;
  }, [events, minMag, sortBy, userLocation]);

  // Convert AFAD events into Map Compatible format for RealLeafletMap
  const mapPharmacies = useMemo(() => {
    return processedEvents.slice(0, 40).map((ev, i) => ({
      id: ev.eventID || String(i),
      name: `${ev.magnitude} M - ${ev.location}`,
      address: `Derinlik: ${ev.depth} km · Tür: ${ev.type} · Tarih: ${new Date(ev.date).toLocaleDateString("tr-TR")} ${new Date(ev.date).toLocaleTimeString("tr-TR")}`,
      phone: ev.eventID,
      location: {
        latitude: parseFloat(ev.latitude),
        longitude: parseFloat(ev.longitude),
      },
      city: { name: ev.province || "Deprem", slug: "deprem" },
      district: { name: ev.district || "", slug: "deprem" },
      duty: { date: ev.date, isVerified: true },
      distance: ev.distanceKm,
    }));
  }, [processedEvents]);

  // Play test audio siren for alarm
  const playAlarmTest = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
      toast.success("Siren sesli alarm testi çalındı!");
    } catch (e) {
      toast.info("Ses çalma tarayıcı engeline takıldı.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white py-10 px-4 border-b border-slate-800">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-black">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-ping" />
                <span>AFAD DEPREM BİLGİ SERVİSİ (CANLI)</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Türkiye Son Depremler Takip Portalı
              </h1>

              <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                T.C. İçişleri Bakanlığı AFAD verileriyle Türkiye ve yakın çevresindeki anlık deprem sarsıntıları, konumunuza olan mesafe, derinlik ve şiddet analizi.
              </p>
            </div>

            {/* Alarm Status Button */}
            <button
              onClick={() => setShowAlarmModal(true)}
              className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg transition-all shrink-0 border cursor-pointer ${
                alarmEnabled
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
            >
              <BellRing className={`w-5 h-5 ${alarmEnabled ? "text-amber-300 animate-bounce" : "text-slate-400"}`} />
              <div className="text-left">
                <div className="leading-tight">Deprem Alarmı</div>
                <div className="text-[10px] font-normal opacity-90">
                  {alarmEnabled ? `${alarmMinMag}+ M Aktif` : "Kurmak için Tıklayın"}
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Controls & Filter Panel */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Time Range Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setTimeRange("24h")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  timeRange === "24h" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Son 24 Saat
              </button>
              <button
                onClick={() => setTimeRange("7d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  timeRange === "7d" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Son 7 Gün
              </button>
              <button
                onClick={() => setTimeRange("30d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  timeRange === "30d" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Son 30 Gün
              </button>
            </div>

            {/* Min Magnitude Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Büyüklük:</span>
              <select
                value={minMag}
                onChange={(e) => setMinMag(parseFloat(e.target.value))}
                className="bg-transparent font-black text-slate-900 outline-none cursor-pointer"
              >
                <option value={0}>Tümü (Tüm Büyüklükler)</option>
                <option value={2.0}>2.0 ve üzeri</option>
                <option value={3.0}>3.0 ve üzeri</option>
                <option value={4.0}>4.0 ve üzeri (Hissedilebilir)</option>
                <option value={5.0}>5.0 ve üzeri (Şiddetli)</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-black text-slate-900 outline-none cursor-pointer"
              >
                <option value="date">En Yeni Tarih</option>
                <option value="mag">En Şiddetli (M)</option>
                <option value="dist">En Yakın Konum (KM)</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchEarthquakes}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Yenile</span>
          </button>
        </div>

        {/* Live Leaflet Map View */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
          <div className="p-3 bg-slate-900 text-white text-xs font-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>AFAD CANLI DEPREM SISMİK HARİTASI ({processedEvents.length} Kayıt)</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{source}</span>
          </div>

          <RealLeafletMap
            pharmacies={mapPharmacies as any}
            selectedPharmacy={0}
            onSelect={() => {}}
            userLocation={userLocation}
            areaTitle="AFAD Türkiye Deprem Haritası"
          />
        </div>

        {/* Earthquake List Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              <span>Son Depremler Listesi ({processedEvents.length})</span>
            </h2>

            {userLocation && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                📍 Konumunuza göre mesafeler hesaplandı
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
              <p className="text-sm font-bold text-slate-600">AFAD Deprem Verileri Yükleniyor...</p>
            </div>
          ) : processedEvents.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-base font-bold text-slate-800">Kriterlere Uygun Deprem Kaydı Bulunamadı</p>
              <p className="text-xs text-slate-500">Lütfen filtreleri sıfırlayarak tekrar deneyiniz.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {processedEvents.map((ev) => {
                const mag = ev.magNum;
                let badgeStyle = "bg-slate-100 text-slate-800 border-slate-300";
                if (mag >= 5.0) badgeStyle = "bg-red-600 text-white border-red-700 animate-pulse";
                else if (mag >= 4.0) badgeStyle = "bg-amber-500 text-white border-amber-600";
                else if (mag >= 3.0) badgeStyle = "bg-emerald-600 text-white border-emerald-700";

                const dateObj = new Date(ev.date);
                const timeAgo = formatTimeAgo(dateObj);

                return (
                  <article
                    key={ev.eventID + ev.date}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-400 shadow-xs hover:shadow-md transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-lg text-sm font-black border shadow-2xs ${badgeStyle}`}>
                          {ev.magnitude} M
                        </span>

                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {timeAgo} ({dateObj.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug break-words">
                        {ev.location}
                      </h3>

                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 pt-1">
                        <span>Derinlik: <strong className="text-slate-800">{ev.depth} km</strong></span>
                        <span>Tür: <strong className="text-slate-800">{ev.type}</strong></span>
                        {ev.distanceKm !== undefined && (
                          <span className="text-red-700 font-extrabold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            📍 {formatDistance(ev.distanceKm)} uzaklıkta
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${ev.latitude},${ev.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 transition-all flex items-center justify-center"
                      title="Haritada Göster"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Alarm Setup Modal */}
      {showAlarmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-black text-slate-900">AFAD Deprem Alarm Ayarları</h3>
              </div>
              <button
                onClick={() => setShowAlarmModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Belirlediğiniz büyüklük eşiğini aşan bir deprem algılandığında veya yakınınızda sarsıntı kaydedildiğinde sesli uyarı verilir.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase text-slate-700">
                Alarm Eşik Büyüklüğü (Richter Scale):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3.0, 4.0, 5.0].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAlarmMinMag(m)}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      alarmMinMag === m
                        ? "bg-red-600 text-white border-red-700 shadow-xs"
                        : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {m}+ M
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={playAlarmTest}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-red-600" />
                  <span>Alarm Sesini Test Et (Siren)</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setAlarmEnabled(false);
                  setShowAlarmModal(false);
                  toast.info("Deprem alarmı kapatıldı.");
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Devre Dışı Bırak
              </button>

              <button
                onClick={() => {
                  setAlarmEnabled(true);
                  setShowAlarmModal(false);
                  toast.success(`${alarmMinMag}+ M için Deprem Alarmı Aktifleştirildi!`);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer"
              >
                Alarmı Kaydet & Aç
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Az önce";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}
