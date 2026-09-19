import { Check, Clock3, Database, Info, RefreshCw } from "lucide-react";
import { PageIntro, SectionHeading } from "@/components/SiteLayout";

const dataRows = [
  { city: "ANKARA", source: "Ankara İl Sağlık Müdürlüğü", pulled: "12:30", next: "12:45", status: "Güncel" },
  { city: "BURSA", source: "Bursa İl Sağlık Müdürlüğü", pulled: "12:25", next: "12:40", status: "Güncel" },
  { city: "İSTANBUL", source: "İstanbul İl Sağlık Müdürlüğü", pulled: "12:20", next: "12:35", status: "Güncel" },
  { city: "İZMİR", source: "İzmir İl Sağlık Müdürlüğü", pulled: "12:15", next: "12:30", status: "Güncel" },
  { city: "ANTALYA", source: "Antalya İl Sağlık Müdürlüğü", pulled: "12:10", next: "12:25", status: "Güncel" },
  { city: "ADANA", source: "Adana İl Sağlık Müdürlüğü", pulled: "12:05", next: "12:20", status: "Güncel" },
];

export default function DataSources() {
  return (
    <main>
      <PageIntro eyebrow="ŞEFFAFLIK" title="Eczane verileri nereden geliyor?" description="Nöbetçi Eczanem'de gördüğünüz bilgiler, şehirlerin resmi sağlık kaynaklarından düzenli olarak kontrol edilir." />
      <section className="sources-section">
        <div className="container">
          <div className="source-summary">
            <div className="source-summary-icon"><Database size={26} /></div>
            <div><h2>Veriler düzenli olarak yenileniyor</h2><p>Listemizdeki şehirlerin nöbet bilgileri belirli aralıklarla kontrol edilir. Son kontrol zamanı her şehir için ayrı ayrı gösterilir.</p></div>
            <div className="source-summary-time"><span className="status-dot" /><strong>Son sistem kontrolü</strong><span>12:30</span></div>
          </div>

          <div className="sources-layout">
            <div className="city-table-card">
              <div className="table-card-header"><div><p className="eyebrow">ŞEHİR DURUMU</p><h2>Güncel veri akışı</h2></div><span className="table-count">6 şehir aktif</span></div>
              <div className="city-table" role="table" aria-label="Şehir veri durumları">
                <div className="city-table-row table-header" role="row"><span>ŞEHİR</span><span>VERİ KAYNAĞI</span><span>SON ÇEKİLME</span><span>DURUM</span></div>
                {dataRows.map((row) => (
                  <div className="city-table-row" role="row" key={row.city}>
                    <strong>{row.city}</strong><span className="source-name">{row.source}</span><span><strong>{row.pulled}</strong><small> Sonraki: {row.next}</small></span><span className="fresh-status"><Check size={16} /> {row.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <aside className="sources-aside">
              <div className="aside-icon"><Info size={22} /></div>
              <h3>Bu bilgiler ne anlama geliyor?</h3>
              <p><strong>Veri kaynağı:</strong> İlgili şehrin nöbetçi eczane duyurularını sağlayan resmi kurum.</p>
              <p><strong>Son çekilme:</strong> Bilginin sistemimizde son kontrol edildiği saat.</p>
              <p><strong>Sonraki güncelleme:</strong> Bir sonraki otomatik kontrol için tahmini saat.</p>
              <div className="aside-foot"><RefreshCw size={17} /> Kontroller gün boyunca devam eder.</div>
            </aside>
          </div>
        </div>
      </section>
      <section className="source-principles">
        <div className="container">
          <SectionHeading eyebrow="BİZİM İÇİN ÖNEMLİ" title="Doğru bilgi, anlaşılır sunum" description="Teknik ayrıntıları arka planda tutuyor, ihtiyacınız olan bilgiyi açıkça gösteriyoruz." />
          <div className="principles-grid"><div><Clock3 size={22} /><h3>Zamanında</h3><p>Gün içinde düzenli kontrollerle nöbet bilgilerinin güncel kalmasını sağlıyoruz.</p></div><div><Check size={22} /><h3>Açıkça</h3><p>Her şehir için kaynak, son kontrol ve bir sonraki güncelleme saatini gösteriyoruz.</p></div><div><Database size={22} /><h3>Sorumlu</h3><p>Resmi kaynakları temel alıyor, bilgilerin kapsamını ve zamanını saklamıyoruz.</p></div></div>
        </div>
      </section>
    </main>
  );
}
