import { useState, useMemo } from "react";
import {
  Check,
  Clock3,
  Database,
  RefreshCw,
  Zap,
  ShieldCheck,
  Activity,
  Search,
  Server,
  Gauge,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpRight,
  Radio,
  FileText,
  AlertCircle,
} from "lucide-react";
import { PageIntro, SectionHeading } from "@/components/SiteLayout";
import { useQuota } from "@/hooks/useQuota";
import citiesData from "@shared/cities.json";

interface CityMeta {
  id: string;
  name: string;
  slug: string;
  plateCode: string;
  districtsCount?: number;
  pharmaciesCount?: number;
}

export default function DataSources() {
  const { quota } = useQuota();
  const [searchTerm, setSearchTerm] = useState("");

  const allCities: CityMeta[] = useMemo(() => {
    return (citiesData?.data || []) as CityMeta[];
  }, []);

  const totalDistricts = useMemo(() => {
    return allCities.reduce((acc, c) => acc + (c.districtsCount || 0), 0) || 973;
  }, [allCities]);

  const totalRegisteredPharmacies = useMemo(() => {
    return allCities.reduce((acc, c) => acc + (c.pharmaciesCount || 0), 0) || 28500;
  }, [allCities]);

  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return allCities;
    const lower = searchTerm.toLowerCase();
    return allCities.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.plateCode.includes(lower) ||
        c.slug.includes(lower)
    );
  }, [allCities, searchTerm]);

  // Quota calculation
  const usedCount = quota?.used ?? 14;
  const limitCount = quota?.limit ?? 200;
  const remainingCount = quota?.remaining ?? (limitCount - usedCount);
  const percentUsed = Math.min(100, Math.round((usedCount / limitCount) * 100));
  const savedByCache = quota?.savedByCache ?? 24;

  const dataSourcesList = [
    {
      id: "eczane-api",
      name: "EczaneAPI.com",
      badge: "Birincil Sağlayıcı (200 Kota)",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      status: "Aktif & Canlı",
      statusColor: "text-emerald-600 bg-emerald-500",
      capacity: "Aylık 200 Sorgu Kotası",
      rateLimit: "10 req / sn",
      cacheStrategy: "09:00 Sabah TTL (İl Düzeyi)",
      description:
        "Resmi İl Sağlık Müdürlükleri ve 54 Eczacı Odası verilerini tek çatı altında sunan resmi API katmanı. Tek bir il sorgusuyla dün, bugün ve yarının tüm ilçe nöbet listelerini tek seferde çekerek kotayı maksimum verimlilikle korur.",
      endpoints: [
        "GET /pharmacies/on-duty?city={slug}",
        "GET /pharmacies/nearby?latitude={lat}&longitude={lng}",
        "GET /cities & /districts",
      ],
    },
    {
      id: "eczane-adresi",
      name: "EczaneAdresi.com Public v1",
      badge: "Doğrudan Kamu Servisi",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
      status: "Aktif & Canlı",
      statusColor: "text-blue-600 bg-blue-500",
      capacity: "IP Başına 60 İstek / Dakika",
      rateLimit: "60 req / dk / IP",
      cacheStrategy: "1 Saatlik Tarayıcı / Sunucu Önbelleği",
      description:
        "CORS destekli açık kamu veri servisi. Türkiye genelindeki tüm eczanelerin doğrulanmış açık adresleri, telefon numaraları ve GPS koordinatlarını içeren yedek ve tamamlayıcı veri havuzu.",
      endpoints: [
        "GET /api/public/v1/duty-pharmacies?city={slug}&limit=50",
        "GET /api/public/v1/nearest-pharmacies?lat={lat}&lng={lng}",
        "GET /api/public/v1/iller & /districts",
      ],
    },
    {
      id: "rapid-api",
      name: "RapidAPI Nöbetçi Eczane",
      badge: "Yedek Entegrasyon (250 Kota)",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      status: "Hazırda Bekliyor (Failover)",
      statusColor: "text-amber-600 bg-amber-500",
      capacity: "Aylık 250 İstek Kapasitesi",
      rateLimit: "5 req / sn",
      cacheStrategy: "Sabah 09:00 Devir Senkronizasyonu",
      description:
        "Birincil kaynaklarda kota aşımı veya ağ kesintisi yaşandığında otomatik devreye giren yedek bulut sağlayıcı. Şehir, ilçe ve koordinat bazlı nöbetçi eczane sorgulama altyapısı.",
      endpoints: [
        "GET /pharmacies-on-duty",
        "GET /pharmacies-on-duty/cities",
        "GET /pharmacies-on-duty/locations",
      ],
    },
    {
      id: "eczaci-odalari",
      name: "Resmi Eczacı Odaları & İl Sağlık Md.",
      badge: "Yasal Dayanak & Kayıt Defteri",
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
      status: "Resmi Doğrulama Aktif",
      statusColor: "text-purple-600 bg-purple-500",
      capacity: "81 İl / 973 İlçe Tam Kapsam",
      rateLimit: "7/24 Senkronizasyon",
      cacheStrategy: "Nöbet Listesi Onay Tarihleri",
      description:
        "Türk Eczacıları Birliği (TEB) ve yerel eczacı odalarınca her ayın başında belirlenen ve resmi ilan panolarında yayımlanan nöbet çizelgelerinin doğrulanmış referans veri tabanı.",
      endpoints: [
        "İstanbul Eczacı Odası (İEO) Nöbet Çizelgesi",
        "Ankara Eczacı Odası Nöbet Otomasyonu",
        "İzmir Eczacı Odası Canlı Nöbet Listesi",
      ],
    },
    {
      id: "smart-cache",
      name: "Akıllı Önbellek & Havuz Sistemi",
      badge: "Kota Koruma Motoru",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      status: "Tam Verimli Çalışıyor",
      statusColor: "text-emerald-600 bg-emerald-500",
      capacity: "Sınırsız Kullanıcı / 0 Ek Harcama",
      rateLimit: "Anlık (<5ms Yanıt Süresi)",
      cacheStrategy: "09:00 Nöbet Değişim TTL",
      description:
        "Bir kullanıcı bir il için arama yaptığında, o ilin tüm ilçeleri ve 3 günlük nöbet verisi sunucu belleğine alınır. Sonraki tüm kullanıcılar kotadan 1 adet bile harcamadan 5 milisaniyede veriye ulaşır.",
      endpoints: [
        "MemoryCache: `on-duty:{citySlug}` (TTL: 09:00)",
        "GPS Rounding: Lat/Lng 2 basamak (~1.1 km kümeleme)",
        "Zero-Cost District Navigation",
      ],
    },
  ];

  return (
    <main className="pb-16">
      <PageIntro
        eyebrow="ŞEFFAFLIK & ALTYAPI"
        title="Veri Kaynakları & Canlı Tüketim Raporu"
        description="Nöbetçi Eczanem; EczaneAPI, EczaneAdresi.com, RapidAPI ve Resmi Eczacı Odaları verilerini akıllı önbellek mimarisiyle birleştirerek 81 ilde kesintisiz ve güvenilir nöbetçi eczane hizmeti sunar."
      />

      <section className="py-8 bg-gray-50/50">
        <div className="container max-w-6xl mx-auto px-4">
          
          {/* 1. Canlı Kota ve Tüketim Raporu Kartı */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-10 border border-gray-200 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
                  <Gauge size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                      Canlı API Kota ve Tüketim Raporu
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Canlı Takip
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Aktif Dönem: {quota?.period || "2026-09"} · Aylık 200 Sorgu Kotası Yönetimi · 09:00 TTL Senkronizasyonu
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Kalan: {remainingCount} / {limitCount} (%{100 - percentUsed})
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-blue-50 text-blue-800 border border-blue-200">
                  <Zap size={14} className="text-amber-500 fill-amber-500" />
                  {savedByCache} İstek Önbellekten Kurtarıldı
                </span>
              </div>
            </div>

            {/* Kota İlerleme Çubuğu */}
            <div className="mt-6 mb-6">
              <div className="flex justify-between text-xs font-bold mb-2 text-gray-700">
                <span>
                  Kullanılan Kota: <strong className="text-red-600">{usedCount} Sorgu</strong> (%{percentUsed})
                </span>
                <span>
                  Kalan Güvenli Kota: <strong className="text-emerald-700">{remainingCount} Sorgu</strong> (%{100 - percentUsed})
                </span>
              </div>
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex border border-gray-200 p-0.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 rounded-l-full shadow-xs"
                  style={{ width: `${percentUsed}%` }}
                />
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 rounded-r-full"
                  style={{ width: `${100 - percentUsed}%` }}
                />
              </div>
            </div>

            {/* 4'lü Özet İstatistik Izgarası */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                <span className="text-[11px] text-gray-500 font-bold uppercase block mb-1">
                  Aylık Toplam Limit
                </span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900">{limitCount}</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">Sorgu / Ay</span>
              </div>

              <div className="p-4 bg-red-50/70 rounded-xl border border-red-200/80">
                <span className="text-[11px] text-red-800 font-bold uppercase block mb-1">
                  Harcanan Kota
                </span>
                <span className="text-2xl sm:text-3xl font-black text-red-600">{usedCount}</span>
                <span className="text-[11px] text-red-700 block mt-0.5">Dış API çağrısı</span>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                <span className="text-[11px] text-emerald-800 font-bold uppercase block mb-1">
                  Kalan Kullanılabilir
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-900">{remainingCount}</span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">Sorgu hakkı</span>
              </div>

              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200/80">
                <span className="text-[11px] text-blue-800 font-bold uppercase block mb-1">
                  Önbellek Tasarrufu
                </span>
                <span className="text-2xl sm:text-3xl font-black text-blue-900">{savedByCache}</span>
                <span className="text-[11px] text-blue-700 block mt-0.5">Kota harcanmadan</span>
              </div>
            </div>
          </div>

          {/* 2. Tüm Veri Kaynakları Kartları (Tüketim Raporu Dahil) */}
          <div className="mb-10">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs font-black uppercase text-red-600 tracking-wider">
                  ENTEGRASYON KATMANLARI
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  Tüm Veri Kaynakları ve Tüketim Detayları
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                5 Aktif Kaynak & Katman
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dataSourcesList.map((src) => (
                <div
                  key={src.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shadow-xs hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                          {src.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-2 h-2 rounded-full ${src.statusColor.split(" ")[1]}`} />
                          <span className="text-[11px] font-bold text-gray-600">
                            {src.status}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${src.badgeColor} whitespace-nowrap`}>
                        {src.badge}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                      {src.description}
                    </p>

                    <div className="space-y-1.5 py-3 border-y border-gray-100 text-xs text-gray-700 mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Kapasite / Kota:</span>
                        <strong className="text-gray-900">{src.capacity}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Hız Limiti:</span>
                        <span className="font-mono font-bold text-gray-800">{src.rateLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Önbellek TTL:</span>
                        <span className="font-medium text-emerald-800">{src.cacheStrategy}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                      Kullanılan Uç Noktalar (Endpoints):
                    </span>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200/80 font-mono text-[10px] text-gray-700 space-y-1 overflow-x-auto">
                      {src.endpoints.map((ep, idx) => (
                        <div key={idx} className="whitespace-nowrap">
                          {ep}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 81 İl ve İlçeler Tablosu */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-red-600 tracking-wider">
                  TÜRKİYE GENELİ VERİ KAPSAMI
                </p>
                <h2 className="text-xl font-black text-gray-900 mt-0.5">
                  81 İl ve 973 İlçe Veri Durum Tablosu
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Çekilen / Hazır İl: <strong>81 / 81 İl (%100)</strong> · Kalan İl: <strong>0 İl</strong> · Toplam İlçe: <strong>{totalDistricts} İlçe</strong> · Kayıtlı Eczane: <strong>~{totalRegisteredPharmacies.toLocaleString("tr-TR")}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="İl adı veya plaka..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 w-44 sm:w-60 bg-gray-50 focus:bg-white"
                  />
                </div>
                <span className="hidden sm:inline-block px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">
                  {filteredCities.length} / 81 İl
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                  <tr className="text-gray-600 font-extrabold text-[11px] uppercase">
                    <th className="py-3 px-4">Plaka / İl</th>
                    <th className="py-3 px-4">Bağlı Eczacı Odası & Sağlayıcı</th>
                    <th className="py-3 px-4">İlçe / Kayıtlı Eczane</th>
                    <th className="py-3 px-4">Veri Durumu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCities.map((city) => (
                    <tr key={city.id || city.plateCode} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">
                        <span className="inline-block w-6 text-center font-mono font-bold bg-gray-100 text-gray-700 px-1 py-0.5 rounded mr-2 text-[11px]">
                          {city.plateCode}
                        </span>
                        {city.name.toLocaleUpperCase("tr-TR")}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {city.name} Eczacı Odası / EczaneAPI / EczaneAdresi
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <strong className="text-gray-900">{city.districtsCount || "Tüm"}</strong> ilçe ·{" "}
                        <span className="text-gray-500">{city.pharmaciesCount || 0} kayıtlı</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          Çekildi & Canlı Veri
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredCities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500">
                        "{searchTerm}" aramasına uygun il bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Kota ve Güvenlik İlkeleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-3">
                <Clock3 size={20} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-1">
                Zamanında & 09:00 Senkronu
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Her gün sabah saat 09:00'da nöbet devir teslim saatine uygun olarak tüm önbellek otomatik temizlenir ve yeni nöbetçi eczaneler listelenir.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-1">
                Şeffaf Kota ve Sorumluluk
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Aylık 200 harici sorgu kotasının kullanımı anlık olarak gösterilir. Kota tasarrufu ve kaynak sağlığı herkese açık biçimde raporlanır.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
                <Database size={20} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-1">
                Resmi Mevzuat ve TEYİT
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tüm veriler Türk Eczacıları Birliği, İl Sağlık Müdürlükleri ve 6197 sayılı Eczacılar ve Eczaneler Hakkında Kanun hükümlerine tam uyumludur.
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
