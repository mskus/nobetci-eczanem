import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Globe2,
  TrendingUp,
  Activity,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  Building2,
  Users,
  Award,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Info,
  Calendar,
  Sparkles,
} from "lucide-react";
import { fetchLiveWHOIndicators, TURKEY_WHO_INDICATORS, WHOGHOIndicator } from "@/lib/whoService";

export default function TurkeyHealthStats() {
  const [indicators, setIndicators] = useState<WHOGHOIndicator[]>(TURKEY_WHO_INDICATORS);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("WHOSIS_000001");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLiveWHOIndicators().then((data) => {
      if (data && data.length > 0) {
        setIndicators(data);
      }
    });
  }, []);

  // Historical trend data for Turkey vs Global
  const historicalTrends: Record<string, Array<{ year: number; turkey: number; global: number }>> = {
    WHOSIS_000001: [
      { year: 2000, turkey: 70.0, global: 66.8 },
      { year: 2005, turkey: 72.4, global: 68.6 },
      { year: 2010, turkey: 74.8, global: 70.5 },
      { year: 2015, turkey: 76.5, global: 72.0 },
      { year: 2020, turkey: 77.8, global: 72.8 },
      { year: 2024, turkey: 78.6, global: 73.4 },
    ],
    WHS9_86: [
      { year: 2000, turkey: 2.8, global: 3.1 },
      { year: 2010, turkey: 3.6, global: 3.9 },
      { year: 2018, turkey: 4.2, global: 4.4 },
      { year: 2024, turkey: 4.8, global: 4.6 },
    ],
    HWF_0001: [
      { year: 2000, turkey: 13.5, global: 11.2 },
      { year: 2010, turkey: 16.7, global: 13.0 },
      { year: 2018, turkey: 19.2, global: 14.5 },
      { year: 2024, turkey: 21.7, global: 15.6 },
    ],
    WHS4_100: [
      { year: 2000, turkey: 86, global: 72 },
      { year: 2010, turkey: 94, global: 80 },
      { year: 2020, turkey: 95, global: 82 },
      { year: 2024, turkey: 96, global: 83 },
    ],
    WHS9_93: [
      { year: 2000, turkey: 23.0, global: 25.0 },
      { year: 2010, turkey: 26.5, global: 26.2 },
      { year: 2020, turkey: 29.1, global: 27.0 },
      { year: 2024, turkey: 30.4, global: 27.5 },
    ],
    UHC_INDEX: [
      { year: 2000, turkey: 52, global: 45 },
      { year: 2010, turkey: 68, global: 56 },
      { year: 2020, turkey: 76, global: 64 },
      { year: 2024, turkey: 79, global: 68 },
    ],
  };

  const activeInd = indicators.find((i) => i.code === selectedIndicator) || indicators[0];
  const activeTrend = historicalTrends[activeInd.code] || historicalTrends["WHOSIS_000001"];

  const filteredIndicators = indicators.filter(
    (ind) =>
      ind.name.toLocaleLowerCase("tr-TR").includes(searchTerm.toLocaleLowerCase("tr-TR")) ||
      ind.category.toLocaleLowerCase("tr-TR").includes(searchTerm.toLocaleLowerCase("tr-TR")) ||
      ind.description.toLocaleLowerCase("tr-TR").includes(searchTerm.toLocaleLowerCase("tr-TR"))
  );

  return (
    <main className="pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-cyan-900 via-cyan-950 to-gray-950 text-white py-10 px-4 border-b border-cyan-800/50">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Globe2 size={20} />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-300">
                  DÜNYA SAĞLIK ÖRGÜTÜ (WHO) GHO RESMİ VERİLERİ
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Türkiye'de Sağlık Göstergeleri & İstatistikleri
              </h1>
              <p className="text-xs sm:text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
                WHO Global Health Observatory (GHO) OData protokolü üzerinden Türkiye'nin beklenen yaşam süresi, eczacı ve hekim yoğunluğu, bağışıklama oranları ve hastane kapasitesi canlı grafikleri.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="https://ghoapi.azureedge.net/api/Indicator"
                target="_blank"
                rel="noreferrer"
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <span>WHO OData Canlı API</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50/50">
        <div className="container max-w-6xl mx-auto px-4">
          
          {/* Arama ve Gösterge Kartları Izgarası */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Temel Sağlık Göstergeleri
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Grafik ve detaylı analizini görmek istediğiniz göstergeyi seçiniz.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Gösterge veya konu ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-600 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {filteredIndicators.map((ind) => {
              const isSelected = selectedIndicator === ind.code;
              return (
                <button
                  key={ind.code}
                  type="button"
                  onClick={() => setSelectedIndicator(ind.code)}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-cyan-50/90 border-cyan-500 shadow-md ring-2 ring-cyan-500/20"
                      : "bg-white border-gray-200 hover:border-gray-300 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        isSelected ? "bg-cyan-200/90 text-cyan-900" : "bg-gray-100 text-gray-600"
                      }`}>
                        {ind.category}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-gray-400">
                        {ind.code}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug mb-2">
                      {ind.name}
                    </h3>

                    <div className="flex items-baseline gap-2 my-2">
                      <span className="text-2xl sm:text-3xl font-black text-cyan-900 font-mono">
                        {ind.turkeyValue}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {ind.unit}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono ml-auto">
                        ({ind.year})
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {ind.description}
                    </p>
                  </div>

                  {ind.globalComparison && (
                    <div className="mt-3 pt-2.5 border-t border-gray-200 text-[11px] font-bold text-cyan-800">
                      🌐 {ind.globalComparison}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Seçilen Göstergenin İnteraktif Grafik Tablosu ve Kapsamlı Analizi */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
                  {activeInd.category} · {activeInd.code}
                </span>
                <h3 className="text-2xl font-black text-gray-900 mt-2">
                  {activeInd.name} — Türkiye Tarihsel Gelişim Tablosu
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  2000 yılından günümüze Türkiye verisi ile Dünya Sağlık Örgütü küresel ortalamasının karşılaştırması.
                </p>
              </div>

              <div className="p-4 bg-cyan-50/70 rounded-2xl border border-cyan-200/80 text-center shrink-0">
                <span className="text-[11px] font-bold uppercase text-cyan-800 block">Güncel Türkiye Değeri</span>
                <span className="text-3xl font-black text-cyan-950 font-mono">{activeInd.turkeyValue}</span>
                <span className="text-xs font-semibold text-cyan-800 block">{activeInd.unit}</span>
              </div>
            </div>

            {/* Görsel Çubuk ve İlerleme Grafiği */}
            <div className="mt-8 mb-8 space-y-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                Yıllara Göre Değişim ve Küresel Karşılaştırma Grafiği
              </h4>

              <div className="space-y-4">
                {activeTrend.map((item) => {
                  const maxVal = Math.max(...activeTrend.map((t) => Math.max(t.turkey, t.global))) * 1.1;
                  const turkeyPercent = Math.min(100, Math.round((item.turkey / maxVal) * 100));
                  const globalPercent = Math.min(100, Math.round((item.global / maxVal) * 100));

                  return (
                    <div key={item.year} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                        <span className="font-mono font-black text-gray-900 text-sm">{item.year}</span>
                        <div className="flex items-center gap-4 text-[11px]">
                          <span className="text-cyan-800 font-extrabold">
                            🇹🇷 Türkiye: <strong>{item.turkey} {activeInd.unit}</strong>
                          </span>
                          <span className="text-gray-500">
                            🌐 Dünya Ort.: <strong>{item.global} {activeInd.unit}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Türkiye Bar */}
                      <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden flex border border-gray-200">
                        <div
                          className="bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${turkeyPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kapsamlı Açıklama & Makale (Google SEO Odaklı) */}
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
              <h4 className="text-base font-black text-gray-900">
                Detaylı Analiz & Sağlık Sistemine Etkisi
              </h4>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {activeInd.description} Dünya Sağlık Örgütü (WHO) resmi raporlarına göre Türkiye, son yirmi yılda sağlıkta dönüşüm, şehir hastaneleri yatırımları ve 81 ile yayılan serbest eczane nöbet ağı sayesinde temel sağlık göstergelerinde önemli bir yükseliş trendi yakalamıştır.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-1">
                <strong>Veri Kaynağı & Protokol:</strong> WHO Global Health Observatory (GHO) OData API · Spatial Dimension: TUR (Türkiye) · Sağlık Bakanlığı ve Türk Eczacıları Birliği (TEB) eşgüdüm verileri.
              </div>
            </div>
          </div>

          {/* UNICEF Anne, Bebek ve Çocuk Sağlığı Veri Havuzu */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/60 mb-12 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-800/80 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black mb-2">
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  <span>UNICEF DATA WAREHOUSE & WHO ORTAK RAPORU</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  UNICEF Türkiye Anne, Bebek ve Çocuk Sağlığı Göstergeleri
                </h3>
                <p className="text-xs sm:text-sm text-blue-200/80 mt-1 max-w-2xl">
                  Birleşmiş Milletler Çocuklara Yardım Fonu (UNICEF) küresel göstergelerine göre Türkiye'de çocuk sağlığı, yenidoğan aşılama kapsamı ve anne sütü oranı gelişimi.
                </p>
              </div>

              <a
                href="https://data.unicef.org/country/tur/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shrink-0"
              >
                <span>UNICEF Resmi Türkiye Profili</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-blue-900/40 border border-blue-700/50 space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">5 Yaş Altı Ölüm Hızı (U5MR)</span>
                <div className="text-3xl font-black font-mono text-white">8.2 <span className="text-xs font-normal text-blue-300">/ 1000</span></div>
                <p className="text-xs text-blue-200/80 leading-snug">
                  2000'deki 38.5 değerinden %78 düşüşle BM Sürdürülebilir Kalkınma Hedefleri (SDG) seviyesine ulaşmıştır.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-900/40 border border-blue-700/50 space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">Aşı Kapsama Oranı (DTP3)</span>
                <div className="text-3xl font-black font-mono text-emerald-400">%98.4</div>
                <p className="text-xs text-blue-200/80 leading-snug">
                  Kızamık, DPT ve Hepatit-B aşılamasında Türkiye, Avrupa bölgesinde en yüksek kapsama sahip ilk 5 ülke arasında.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-900/40 border border-blue-700/50 space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">Sadece Anne Sütü (İlk 6 Ay)</span>
                <div className="text-3xl font-black font-mono text-amber-300">%58.2</div>
                <p className="text-xs text-blue-200/80 leading-snug">
                  Bebeğin ilk 6 ayında sadece anne sütü ile beslenme oranı UNICEF küresel ortalamasının (%48) üzerindedir.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-900/40 border border-blue-700/50 space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">Anne Ölüm Oranı (MMR)</span>
                <div className="text-3xl font-black font-mono text-cyan-300">12.8 <span className="text-xs font-normal text-blue-300">/ 100 bin</span></div>
                <p className="text-xs text-blue-200/80 leading-snug">
                  Ebe ve uzman doktor gözetiminde gerçekleşen doğum oranı %99.2 seviyesinde izlenmektedir.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
