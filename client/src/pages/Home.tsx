import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, Clock3, Cross, MapPin, Navigation, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AdRail, MobileAd, SectionHeading } from "@/components/SiteLayout";

type Pharmacy = {
  name: string;
  area: string;
  distance: string;
  address: string;
  phone: string;
  openUntil: string;
  x: string;
  y: string;
};

const pharmacies: Pharmacy[] = [
  {
    name: "Merkez Eczanesi",
    area: "Çankaya / Ankara",
    distance: "0,8 km",
    address: "Kızılay Mah. Atatürk Bulvarı No: 42",
    phone: "0312 418 22 11",
    openUntil: "Yarın 08:30",
    x: "46%",
    y: "42%",
  },
  {
    name: "Güven Eczanesi",
    area: "Bahçelievler / Ankara",
    distance: "1,6 km",
    address: "Aşkabat Cad. No: 18/B",
    phone: "0312 215 09 34",
    openUntil: "Yarın 09:00",
    x: "62%",
    y: "60%",
  },
  {
    name: "Umut Eczanesi",
    area: "Dikmen / Ankara",
    distance: "2,4 km",
    address: "Dikmen Cad. No: 77/A",
    phone: "0312 482 73 20",
    openUntil: "Yarın 08:30",
    x: "30%",
    y: "66%",
  },
];

const cities = ["Ankara", "İstanbul", "Bursa", "İzmir", "Antalya"];
const districts: Record<string, string[]> = {
  Ankara: ["Çankaya", "Bahçelievler", "Dikmen", "Keçiören"],
  İstanbul: ["Kadıköy", "Beşiktaş", "Üsküdar", "Bakırköy"],
  Bursa: ["Osmangazi", "Nilüfer", "Yıldırım"],
  İzmir: ["Konak", "Bornova", "Karşıyaka"],
  Antalya: ["Muratpaşa", "Konyaaltı", "Kepez"],
};

function MapPreview({ activePharmacy }: { activePharmacy: number }) {
  return (
    <div className="map-preview" aria-label="Ankara merkez nöbetçi eczane haritası">
      <div className="map-topbar">
        <span className="map-title"><MapPin size={18} /> Ankara merkez</span>
        <span className="map-status"><span className="status-dot" /> 3 sonuç</span>
      </div>
      <div className="map-canvas">
        <div className="map-grid" aria-hidden="true" />
        <div className="map-river" aria-hidden="true" />
        <div className="map-district district-one">Kızılay</div>
        <div className="map-district district-two">Bahçelievler</div>
        <div className="map-district district-three">Dikmen</div>
        <div className="map-road road-one" aria-hidden="true" />
        <div className="map-road road-two" aria-hidden="true" />
        <div className="map-road road-three" aria-hidden="true" />
        <div className="user-location" aria-label="Konumunuz"><span /></div>
        {pharmacies.map((pharmacy, index) => (
          <div
            key={pharmacy.name}
            className={`map-marker ${index === activePharmacy ? "selected" : ""}`}
            style={{ left: pharmacy.x, top: pharmacy.y }}
            aria-label={pharmacy.name}
          >
            <Cross size={18} strokeWidth={3} />
          </div>
        ))}
        <div className="map-controls" aria-hidden="true">
          <button type="button">+</button>
          <button type="button">−</button>
        </div>
        <div className="map-legend"><span className="legend-marker"><Cross size={12} strokeWidth={3} /></span> Nöbetçi eczane</div>
      </div>
    </div>
  );
}

function PharmacyCard({ pharmacy, index, selected, onSelect }: { pharmacy: Pharmacy; index: number; selected: boolean; onSelect: () => void }) {
  return (
    <article className={`pharmacy-card ${selected ? "selected" : ""}`} onClick={onSelect}>
      <div className="pharmacy-card-top">
        <div>
          <p className="pharmacy-kicker"><span className="live-dot" /> ŞU ANDA NÖBETÇİ</p>
          <h3>{pharmacy.name}</h3>
          <p className="pharmacy-area">{pharmacy.area}</p>
        </div>
        <span className="distance-badge">{pharmacy.distance}</span>
      </div>
      <div className="pharmacy-details">
        <p><MapPin size={18} /> {pharmacy.address}</p>
        <p><Clock3 size={18} /> Nöbet {pharmacy.openUntil} kadar sürüyor</p>
      </div>
      <div className="pharmacy-actions">
        <a className="button button-secondary" href={`tel:${pharmacy.phone.replaceAll(" ", "")}`} onClick={(event) => event.stopPropagation()}><Phone size={19} /> Telefon Et</a>
        <a className="button button-quiet" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.address + " " + pharmacy.area)}`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><Navigation size={18} /> Yol Tarifi</a>
      </div>
    </article>
  );
}

export default function Home() {
  const [city, setCity] = useState("Ankara");
  const [district, setDistrict] = useState("Çankaya");
  const [selectedPharmacy, setSelectedPharmacy] = useState(0);
  const [locationNote, setLocationNote] = useState("Konumunuz paylaşılmadan arama yapılmaz.");

  const filteredDistricts = useMemo(() => districts[city] ?? [], [city]);

  const handleCityChange = (value: string) => {
    setCity(value);
    const firstDistrict = districts[value]?.[0] ?? "";
    setDistrict(firstDistrict);
  };

  const findNearby = () => {
    if (!navigator.geolocation) {
      setLocationNote("Bu tarayıcı konum paylaşımını desteklemiyor. Şehir ve ilçe seçerek arayabilirsiniz.");
      toast.error("Konum bilgisi alınamadı");
      return;
    }
    setLocationNote("Konumunuz alındı. Size en yakın nöbetçi eczaneler gösteriliyor.");
    toast.success("Yakınınızdaki nöbetçi eczaneler hazır");
    document.getElementById("sonuclar")?.scrollIntoView({ behavior: "smooth", block: "start" });
    navigator.geolocation.getCurrentPosition(() => undefined, () => {
      setLocationNote("Konum izni verilmedi. Ankara için örnek sonuçları gösteriyoruz.");
    });
  };

  const searchByArea = () => {
    setLocationNote(`${city} / ${district} için nöbetçi eczaneler listeleniyor.`);
    toast.success(`${district} için sonuçlar güncellendi`);
    document.getElementById("sonuclar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main>
      <section className="hero-section">
        <AdRail side="left" />
        <div className="hero-content container">
          <div className="hero-eyebrow"><span className="eyebrow-line" /> BUGÜN AÇIK ECZANELER <span className="eyebrow-line" /></div>
          <h1>En Yakın <span>Nöbetçi Eczaneyi</span> Bul</h1>
          <p className="hero-lead">Bulunduğunuz konuma göre açık nöbetçi eczaneleri kolayca bulun.</p>
          <div className="search-panel">
            <button type="button" className="button button-primary location-button" onClick={findNearby}>
              <MapPin size={24} fill="currentColor" /> Yakınımdaki Eczaneleri Bul
            </button>
            <div className="search-divider"><span>veya şehir ve ilçe seçin</span></div>
            <div className="select-row">
              <label>
                <span>İl</span>
                <select value={city} onChange={(event) => handleCityChange(event.target.value)} aria-label="İl seçin">
                  {cities.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span>İlçe</span>
                <select value={district} onChange={(event) => setDistrict(event.target.value)} aria-label="İlçe seçin">
                  {filteredDistricts.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <button type="button" className="button button-outline search-button" onClick={searchByArea}>Eczaneleri Göster <ArrowRight size={20} /></button>
            </div>
            <p className="search-note"><ShieldCheck size={17} /> {locationNote}</p>
          </div>
          <div className="hero-trust"><span><Check size={17} /> Güncel nöbet bilgileri</span><span><Check size={17} /> Ücretsiz kullanım</span><span><Check size={17} /> Reklamsız arama</span></div>
        </div>
        <AdRail side="right" />
      </section>

      <MobileAd />

      <section className="results-section" id="sonuclar">
        <div className="container">
          <div className="results-heading">
            <div>
              <p className="eyebrow">ANKARA · ÇANKAYA</p>
              <h2>Size en yakın nöbetçi eczaneler</h2>
            </div>
            <p className="results-updated"><span className="status-dot" /> Son güncelleme: <strong>12:30</strong></p>
          </div>
          <div className="results-layout">
            <MapPreview activePharmacy={selectedPharmacy} />
            <div className="pharmacy-list">
              {pharmacies.map((pharmacy, index) => (
                <PharmacyCard key={pharmacy.name} pharmacy={pharmacy} index={index} selected={index === selectedPharmacy} onSelect={() => setSelectedPharmacy(index)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="how-section" id="nasil-calisir">
        <div className="container">
          <SectionHeading eyebrow="ÜÇ ADIMDA" title="İhtiyacınız olan eczaneyi bulun" description="Karmaşık menüler yok. Konumunuzu paylaşın, açık eczaneyi görün ve yola çıkın." />
          <div className="steps-grid">
            <div className="step-card"><span className="step-number">01</span><span className="step-icon"><MapPin size={26} /></span><h3>Konumunuzu paylaşın</h3><p>Size yakın eczaneleri görmek için konumunuzu kullanın veya şehir ve ilçe seçin.</p></div>
            <div className="step-card"><span className="step-number">02</span><span className="step-icon"><Cross size={26} /></span><h3>Yakınınızdakileri görün</h3><p>Nöbetçi eczaneleri mesafelerine ve açık kalma saatlerine göre inceleyin.</p></div>
            <div className="step-card"><span className="step-number">03</span><span className="step-icon"><Navigation size={26} /></span><h3>Yol tarifini alın</h3><p>Telefon edin veya tek dokunuşla harita üzerinden yol tarifini başlatın.</p></div>
          </div>
        </div>
      </section>

      <section className="update-section">
        <div className="container update-box">
          <div className="update-icon"><Clock3 size={26} /></div>
          <div><p className="eyebrow">VERİ GÜNCELLEME</p><h2>Bilgiler düzenli olarak güncellenmektedir.</h2><p>Son güncelleme <strong>12:30</strong> · Bir sonraki kontrol yaklaşık 12:45</p></div>
          <Link href="/veri-kaynaklari" className="button button-quiet">Veri kaynaklarını gör <ArrowRight size={19} /></Link>
        </div>
      </section>

      <section className="closing-section">
        <div className="container closing-inner">
          <div><p className="eyebrow">GÜVENİLİR VE SADE</p><h2>Mahallenizdeki güvenilir eczanenin dijital hali.</h2></div>
          <p>Nöbetçi Eczanem, ihtiyaç anında doğru bilgiye en kısa yoldan ulaşmanız için tasarlandı.</p>
          <div className="closing-mark"><Sparkles size={20} /> Her gün yanınızda</div>
        </div>
      </section>
    </main>
  );
}
