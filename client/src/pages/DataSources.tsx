import { Check, Clock3, Database, Info, RefreshCw, Zap, ShieldCheck, Activity } from "lucide-react";
import { PageIntro, SectionHeading } from "@/components/SiteLayout";
import { useQuota } from "@/hooks/useQuota";

export default function DataSources() {
  const { quota } = useQuota();

  return (
    <main>
      <PageIntro
        eyebrow="ŞEFFAFLIK & ALTYAPI"
        title="Eczane verileri ve API kotası"
        description="Nöbetçi Eczanem, Türkiye genelinde 81 il ve ilçelerdeki nöbetçi eczane verilerini EczaneAPI üzerinden akıllı önbellek mimarisiyle sunar."
      />

      <section className="sources-section">
        <div className="container">
          {/* Live Quota & Architecture Status Box */}
          {quota && (
            <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <Activity size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">EczaneAPI Kota ve Önbellek Durumu</h3>
                    <p className="text-xs text-gray-500">Dönem: {quota.period} · Aylık 200 Sorgu Kotası</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Kalan Hak: {quota.remaining} / {quota.limit}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    {quota.savedByCache} Sorgu Kurtarıldı
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-bold block mb-1">Aylık Toplam Limit</span>
                  <span className="text-2xl font-black text-gray-900">{quota.limit}</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">Sorgu / Ay</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-bold block mb-1">Harcanan İstek</span>
                  <span className="text-2xl font-black text-red-600">{quota.used}</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">Dış API çağrısı</span>
                </div>
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <span className="text-xs text-emerald-800 font-bold block mb-1">Önbellek Tasarrufu</span>
                  <span className="text-2xl font-black text-emerald-900">{quota.savedByCache}</span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">Kota harcanmadan karşılanan</span>
                </div>
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100">
                  <span className="text-xs text-blue-800 font-bold block mb-1">Tasarruf Oranı</span>
                  <span className="text-2xl font-black text-blue-900">{quota.cacheHitRate}</span>
                  <span className="text-[11px] text-blue-700 block mt-0.5">Önbellek isabet başarısı</span>
                </div>
              </div>
            </div>
          )}

          <div className="source-summary">
            <div className="source-summary-icon">
              <Database size={26} />
            </div>
            <div>
              <h2>Resmi Eczacı Odaları ve Sağlık Bakanlığı Verileri</h2>
              <p>
                Nöbetçi eczane listeleri her gece 00:00'da güncellenir ve Türkiye saati ile sabah 09:00'da nöbet
                devir-teslimi gerçekleşir. Sistemimiz tek bir il sorgusunda tüm ilçeleri ve 3 günlük listeyi topluca
                alarak kotayı maksimum verimlilikle korur.
              </p>
            </div>
            <div className="source-summary-time">
              <span className="status-dot" />
              <strong>Nöbet Değişim Saati</strong>
              <span>Her gün 09:00</span>
            </div>
          </div>

          <div className="sources-layout">
            <div className="city-table-card">
              <div className="table-card-header">
                <div>
                  <p className="eyebrow">VERİ KAPSAMI</p>
                  <h2>81 İl ve Tüm İlçeler</h2>
                </div>
                <span className="table-count">81 İl Aktif</span>
              </div>
              <div className="city-table" role="table" aria-label="Şehir veri durumları">
                <div className="city-table-row table-header" role="row">
                  <span>İL</span>
                  <span>VERİ KAYNAĞI</span>
                  <span>NÖBET DÖNEMİ</span>
                  <span>DURUM</span>
                </div>
                {[
                  { city: "İSTANBUL", source: "İstanbul Eczacı Odası / EczaneAPI", period: "09:00 - 09:00", status: "Aktif & Önbellekte" },
                  { city: "ANKARA", source: "Ankara Eczacı Odası / EczaneAPI", period: "09:00 - 09:00", status: "Aktif & Önbellekte" },
                  { city: "İZMİR", source: "İzmir Eczacı Odası / EczaneAPI", period: "09:00 - 09:00", status: "Aktif & Önbellekte" },
                  { city: "BURSA", source: "Bursa Eczacı Odası / EczaneAPI", period: "09:00 - 09:00", status: "Aktif & Önbellekte" },
                  { city: "ANTALYA", source: "Antalya Eczacı Odası / EczaneAPI", period: "09:00 - 09:00", status: "Aktif & Önbellekte" },
                  { city: "DİĞER 76 İL", source: "Tüm İl Sağlık & Eczacı Odaları", period: "09:00 - 09:00", status: "Canlı Destek" },
                ].map((row) => (
                  <div className="city-table-row" role="row" key={row.city}>
                    <strong>{row.city}</strong>
                    <span className="source-name">{row.source}</span>
                    <span>
                      <strong>{row.period}</strong>
                    </span>
                    <span className="fresh-status">
                      <Check size={16} /> {row.status}
                    </span>
                  </div>
                ))}
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
