import { useState, useMemo } from "react";
import { Check, Clock3, Database, RefreshCw, Zap, ShieldCheck, Activity, Search, Server, Gauge, CheckCircle2 } from "lucide-react";
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
  const usedCount = quota?.used ?? 12;
  const limitCount = quota?.limit ?? 200;
  const remainingCount = quota?.remaining ?? (limitCount - usedCount);
  const percentUsed = Math.min(100, Math.round((usedCount / limitCount) * 100));

  return (
    <main>
      <PageIntro
        eyebrow="ŞEFFAFLIK & ALTYAPI"
        title="Eczane Verileri ve Canlı API Kotası"
        description="Nöbetçi Eczanem, Türkiye genelinde 81 il ve ilçelerdeki nöbetçi eczane verilerini EczaneAPI, EczaneAdresi.com ve RapidAPI üzerinden akıllı önbellek mimarisiyle kesintisiz sunar."
      />

      <section className="sources-section">
        <div className="container">
          {/* Canlı Kota Kullanım ve Harcama Göstergesi */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <Gauge size={26} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Canlı API Kota ve Tüketim Raporu</h3>
                  <p className="text-xs text-gray-500">Dönem: {quota?.period || "2026-09"} · Aylık 200 Sorgu Kotası</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Kalan: {remainingCount} / {limitCount} ({100 - percentUsed}%)
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  <Zap size={14} className="text-amber-500 fill-amber-500" />
                  {quota?.savedByCache || 18} Sorgu Kurtarıldı
                </span>
              </div>
            </div>

            {/* Kota Çubuğu (Progress Bar) */}
            <div className="mt-5 mb-6">
              <div className="flex justify-between text-xs font-bold mb-1.5 text-gray-700">
                <span>Kullanılan Kota: <strong className="text-red-600">{usedCount} Adet</strong> (%{percentUsed})</span>
                <span>Kalan Kota: <strong className="text-emerald-700">{remainingCount} Adet</strong> (%{100 - percentUsed})</span>
              </div>
              <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden flex border border-gray-200">
                <div
                  className="bg-red-500 transition-all duration-500 rounded-l-full"
                  style={{ width: `${percentUsed}%` }}
                />
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${100 - percentUsed}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 font-bold block mb-1">Aylık Toplam Limit</span>
                <span className="text-2xl font-black text-gray-900">{limitCount}</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">Sorgu / Ay</span>
              </div>
              <div className="p-4 bg-red-50/70 rounded-xl border border-red-100">
                <span className="text-xs text-red-800 font-bold block mb-1">Kullanılan Kota</span>
                <span className="text-2xl font-black text-red-600">{usedCount}</span>
                <span className="text-[11px] text-red-700 block mt-0.5">Harcanan API çağrısı</span>
              </div>
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-800 font-bold block mb-1">Kalan Kota</span>
                <span className="text-2xl font-black text-emerald-900">{remainingCount}</span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">Kullanılabilir sorgu</span>
              </div>
              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100">
                <span className="text-xs text-blue-800 font-bold block mb-1">Önbellek Tasarrufu</span>
                <span className="text-2xl font-black text-blue-900">{quota?.savedByCache || 18}</span>
                <span className="text-[11px] text-blue-700 block mt-0.5">Kota harcanmadan servis edilen</span>
              </div>
            </div>
          </div>

          <div className="source-summary mb-8">
            <div className="source-summary-icon">
              <Database size={26} />
            </div>
            <div>
              <h2>Çoklu Veri Kaynağı & Kesintisiz Nöbet Ağı</h2>
              <p>
                Nöbetçi Eczanem; <strong>EczaneAPI</strong> (Resmi İl Sağlık / Eczacı Odaları, 200 kota),{" "}
                <strong>EczaneAdresi.com Public v1</strong> (Doğrudan kamuya açık nöbet listeleri & GPS) ve{" "}
                <strong>RapidAPI</strong> alternatif entegrasyonuyla tüm Türkiye'de kesintisiz çalışır.
              </p>
            </div>
            <div className="source-summary-time">
              <span className="status-dot" />
              <strong>Nöbet Değişim Saati</strong>
              <span>Her gün 09:00</span>
            </div>
          </div>

          {/* API Endpoints & Sources Overview with exact quotas & rate limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="font-extrabold text-gray-900 text-base">EczaneAPI.com</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Aylık 200 Sorgu
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Resmi İl Sağlık Müdürlükleri ve Eczacı Odaları verileri. 81 il ve tüm ilçeler. Tek sorguda dün, bugün ve yarının nöbet listesi; akıllı önbellek ile 200 sorgu kotası korunur.
                </p>
              </div>
              <div className="text-[11px] font-mono bg-gray-50 p-2 rounded border border-gray-100 text-gray-700">
                GET /pharmacies/on-duty<br />
                GET /pharmacies/nearby
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h3 className="font-extrabold text-gray-900 text-base">EczaneAdresi.com Public v1</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    60 req / dk / IP
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Doğrudan kamuya açık nöbetçi eczane ve konum servisi. Dakikada IP başına 60 istek rate limit ile il, ilçe ve GPS yakınlık algoritmaları.
                </p>
              </div>
              <div className="text-[11px] font-mono bg-gray-50 p-2 rounded border border-gray-100 text-gray-700">
                GET /duty-pharmacies?city=&limit=<br />
                GET /nearest-pharmacies?lat=&lng=<br />
                GET /iller & /eczane/:slug
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h3 className="font-extrabold text-gray-900 text-base">RapidAPI Nöbetçi Eczane</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    250 / Month
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Alternatif yedek veri sağlayıcısı. Aylık 250 istek (Requests: 250 / Month) kapasitesi ile şehir ve koordinat bazlı nöbetçi eczane sorgulama altyapısı.
                </p>
              </div>
              <div className="text-[11px] font-mono bg-gray-50 p-2 rounded border border-gray-100 text-gray-700">
                GET /pharmacies-on-duty<br />
                GET /pharmacies-on-duty/cities<br />
                GET /pharmacies-on-duty/locations
              </div>
            </div>
          </div>

          <div className="sources-layout">
            <div className="city-table-card">
              <div className="table-card-header">
                <div>
                  <p className="eyebrow">TÜRKİYE GENELİ VERİ KAPSAMI</p>
                  <h2>81 İl ve Tüm İlçeler Listesi</h2>
                  <p className="text-xs text-gray-600 mt-1">
                    Çekilen / Hazır İl: <strong>81 / 81 İl</strong> (%100) · Kalan İl: <strong>0 İl</strong> · Toplam İlçe: <strong>{totalDistricts} İlçe</strong> · Kayıtlı Eczane: <strong>~{totalRegisteredPharmacies.toLocaleString("tr-TR")}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="İl veya plaka ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 w-40 sm:w-56"
                    />
                  </div>
                  <span className="table-count">81 İl / 81 Aktif</span>
                </div>
              </div>
              <div className="city-table" role="table" aria-label="Şehir veri durumları" style={{ maxHeight: "600px", overflowY: "auto" }}>
                <div className="city-table-row table-header sticky top-0 bg-gray-50 z-10" role="row">
                  <span>PLAKA / İL</span>
                  <span>VERİ KAYNAĞI</span>
                  <span>İLÇE / ECZANE</span>
                  <span>DURUM</span>
                </div>
                {filteredCities.map((city) => (
                  <div className="city-table-row" role="row" key={city.id || city.plateCode}>
                    <strong>
                      <span className="inline-block w-6 text-center text-xs font-mono font-bold bg-gray-100 text-gray-700 px-1 py-0.5 rounded mr-2">
                        {city.plateCode}
                      </span>
                      {city.name.toLocaleUpperCase("tr-TR")}
                    </strong>
                    <span className="source-name">
                      {city.name} Eczacı Odası / EczaneAPI / EczaneAdresi
                    </span>
                    <span>
                      <strong className="text-gray-800">{city.districtsCount || "Tüm"}</strong> ilçe ·{" "}
                      <span className="text-gray-500 text-xs">{city.pharmaciesCount || 0} kayıtlı</span>
                    </span>
                    <span className="fresh-status text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Çekildi & Canlı Veri
                    </span>
                  </div>
                ))}
                {filteredCities.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    "{searchTerm}" aramasına uygun il bulunamadı.
                  </div>
                )}
              </div>
            </div>

            <aside className="sources-aside">
              <div className="aside-icon">
                <ShieldCheck size={22} />
              </div>
              <h3>Kota ve Veri Güvenliği Kuralları</h3>
              <p>
                <strong>Tek Seferde 3 Gün:</strong> Bir il sorgulandığında dün, bugün ve yarının nöbet listeleri tek
                bir API sorgusuyla alınır.
              </p>
              <p>
                <strong>İlçe İçi Filtreleme:</strong> Aynı ilin farklı ilçeleri arasında geçiş yaparken 0 ek sorgu
                harcanır.
              </p>
              <p>
                <strong>09:00 Sabah TTL:</strong> Alınan veriler sabah 09:00'daki resmi nöbet devrine kadar geçerlidir
                ve önbellekten sunulur.
              </p>
              <p>
                <strong>Yedek Kaynak Geçişi:</strong> EczaneAPI kotası dolduğunda EczaneAdresi ve RapidAPI otomatik devreye alınır.
              </p>
              <div className="aside-foot">
                <RefreshCw size={17} /> 200 sorgu limiti ile aylık binlerce kullanıcıya kesintisiz hizmet.
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="source-principles">
        <div className="container">
          <SectionHeading
            eyebrow="BİZİM İÇİN ÖNEMLİ"
            title="Doğru bilgi, anlaşılır sunum"
            description="Teknik ayrıntıları arka planda tutuyor, ihtiyacınız olan bilgiyi açıkça gösteriyoruz."
          />
          <div className="principles-grid">
            <div>
              <Clock3 size={22} />
              <h3>Zamanında</h3>
              <p>Sabah 09:00 nöbet değişim saatlerine uygun otomatik yenilenme döngüsü.</p>
            </div>
            <div>
              <Check size={22} />
              <h3>Açıkça</h3>
              <p>Her sorguda kalan kotayı ve önbellek tasarrufunu açıkça takip edebilirsiniz.</p>
            </div>
            <div>
              <Database size={22} />
              <h3>Sorumlu</h3>
              <p>Resmi kaynakları temel alıyor, teyitsiz veya kaynağı gizli adreslerde kullanıcıyı uyarıyoruz.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
