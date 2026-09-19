import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  HelpCircle,
  FileText,
  MapPin,
  CheckCircle2,
  Share2,
  Stethoscope,
  Pill,
  Smartphone,
  ExternalLink,
  Flame,
  AlertTriangle,
  Info,
  DollarSign,
  Tag,
  Barcode,
  Check,
  X,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";
import { MEDICINES_DATABASE, MedicineItem } from "@/lib/medicineData";
import { PAINKILLER_GUIDE } from "@/lib/painkillerData";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Reçete & Mevzuat" | "İlaç Fiyat & Kullanım" | "Acil Sağlık & Çocuk" | "e-Devlet & MHRS";
  readTime: string;
  date: string;
  keywords: string[];
  content: {
    intro: string;
    sections: Array<{
      heading: string;
      body: string;
      highlights?: string[];
    }>;
    faq?: Array<{ q: string; a: string }>;
  };
}

export const ARTICLES_DATA: Article[] = [
  {
    id: "receteli-recetesiz-rehber",
    slug: "hangi-ilaclar-receteli-hangi-ilaclar-recetesiz-satilir",
    title: "Hangi İlaçlar Reçeteli, Hangileri Reçetesiz (OTC) Satılır? 2026 Mevzuat Rehberi",
    excerpt: "Antibiyotikler neden reçetesiz satılamaz? Reçetesiz alınabilen ağrı kesiciler, vitaminler, kremler ve SGK geri ödeme kapsamındaki kurallar.",
    category: "Reçete & Mevzuat",
    readTime: "5 dk okuma",
    date: "19 Eylül 2026",
    keywords: ["reçetesiz satılan ilaçlar", "reçeteli ilaçlar listesi", "otc ilaçlar", "antibiyotik reçetesiz alınır mı"],
    content: {
      intro: "Türkiye'de 1262 sayılı İspençiyari ve Tıbbi Müstahzarlar Kanunu ve Sağlık Bakanlığı TİTCK mevzuatına göre ilaçlar reçete zorunluluğuna göre sınıflara ayrılır.",
      sections: [
        {
          heading: "1. Reçetesiz Satılabilen İlaçlar (OTC Grubu)",
          body: "Hafif sağlık sorunlarında halk sağlığını tehlikeye atmayacak, bağımlılık yapma veya organ toksisitesi riski düşük ilaçlar reçetesiz serbestçe eczanelerden alınabilir.",
          highlights: [
            "Parasetamol içerikli basit ağrı kesiciler ve ateş düşürücüler (Parol, Minoset vb.)",
            "Mide asit giderici şuruplar ve çiğneme tabletleri (Gaviscon, Rennie, Talcid)",
            "Boğaz pastilleri, antiseptik gargaralar ve burun açıcı deniz suyu spreyleri",
            "D vitamini, C vitamini, çinko, multivitamin ve mineral destekleri",
            "Cilt pişik ve yara bakım kremleri (Bepanthol, Madecassol, Hametan)",
          ],
        },
        {
          heading: "2. Kesinlikle Reçeteyle Satılan İlaçlar (Reçetesiz Satışı Yasak)",
          body: "Yanlış veya kontrolsüz kullanımında direnç gelişimi, organ hasarı veya bağımlılık oluşturabilecek ilaçlar hekim reçetesi olmadan verilemez.",
          highlights: [
            "Tüm Sistemik Antibiyotikler ve Antifungaller (Reçetesiz satılması yasal olarak suçtur)",
            "Kalp, Tansiyon, Ritim Düzenleyici ve Kolesterol İlaçları",
            "Şeker Hastalığı (Diyabet) İlaçları ve İnsülin Çeşitleri",
            "Kortizonlu Tabletler ve İğneler",
            "Yeşil ve Kırmızı Reçeteye Tabi Psikiyatrik ve Narkotik İlaçlar",
          ],
        },
      ],
      faq: [
        {
          q: "Reçetesiz aldığım ilacı SGK öder mi?",
          a: "Hayır. SGK geri ödemesinden yararlanmak için ilacın yetkili hekim tarafından MEDULA sistemine e-reçete olarak girilmiş olması şarttır.",
        },
      ],
    },
  },
  {
    id: "cocuklarda-ates-dusurucu-doz",
    slug: "cocuklarda-ve-bebeklerde-ates-dusurucu-surup-doz-tablosu",
    title: "Çocuklarda ve Bebeklerde Ateş Düşürücü Şurup Doz Tablosu & Kilo Hesabı",
    excerpt: "Parasetamol ve İbuprofen şuruplar kaç ölçek verilmeli? Kilo başına miligram hesabı, dönüşümlü ateş düşürücü verme kuralları ve acil uyarılar.",
    category: "Acil Sağlık & Çocuk",
    readTime: "6 dk okuma",
    date: "19 Eylül 2026",
    keywords: ["çocuklarda ateş düşürücü doz", "parol şurup kaç ölçek", "calpol dolven dönüşümlü", "bebeklerde ateş 38.5"],
    content: {
      intro: "Çocuklarda ateş düşürücü verirken çocuğun yaşı değil, vücut ağırlığı (kilosu) esas alınmalıdır. Yanlış doz vermek yetersiz tedaviye veya karaciğer/böbrek yüküne yol açabilir.",
      sections: [
        {
          heading: "1. Parasetamol Şurup Dozu (10 - 15 mg / kg)",
          body: "Parasetamol (Calpol, Parol, Minoset şurup vb.) çocuğun her kilogramı için tek dozda 10-15 mg hesaplanır. Günde 4 saatten sık aralıklarla verilmemelidir (maksimum 4-5 doz).",
          highlights: [
            "8-10 kg Çocuk: Tek dozda yarım - 1 ölçek (120 mg/5ml)",
            "11-15 kg Çocuk: Tek dozda 1 - 1.5 ölçek (5-7.5 ml)",
            "16-20 kg Çocuk: Tek dozda 1.5 - 2 ölçek (7.5-10 ml)",
            "20 kg Üzeri: Calpol 6 Plus veya 250mg/5ml formları tercih edilebilir",
          ],
        },
        {
          heading: "2. İbuprofen Şurup Dozu (5 - 10 mg / kg)",
          body: "İbuprofen (Dolven, İbofen, Pedifen vb.) 6 aydan büyük bebeklerde ve tok karnına verilmelidir. 6-8 saatte bir tekrarlanabilir.",
        },
        {
          heading: "3. Dönüşümlü İlaç Verme Kuralı",
          body: "Ateş düşürücüler ancak inatçı 39°C üzeri ve tek ilaçla kontrol altına alınamayan durumlarda, hekim onayıyla 4 saatte bir parasetamol ve ibuprofen sırayla verilebilir.",
        },
      ],
    },
  },
  {
    id: "gece-dis-agrisi-cozum",
    slug: "gece-aniden-baslayan-dis-agrisina-acil-cozum-ve-ilac-rehberi",
    title: "Gece Aniden Başlayan Zonklayıcı Diş Ağrısına Acil Müdahale & Nöbetçi Eczane İlaçları",
    excerpt: "Gece uykudan uyandıran iltihaplı diş ağrısına hangi ağrı kesici iyi gelir? Gargara, karanfil yağı ve nöbetçi eczane çözümleri.",
    category: "Acil Sağlık & Çocuk",
    readTime: "4 dk okuma",
    date: "18 Eylül 2026",
    keywords: ["gece diş ağrısı", "diş ağrısına hangi ağrı kesici", "arveles diş ağrısı", "24 saat açık nöbetçi eczane"],
    content: {
      intro: "Gece yatay pozisyona geçildiğinde baş bölgesindeki kan basıncının artması, diş pulpası içindeki iltihabın şiddetli zonklamasına neden olur.",
      sections: [
        {
          heading: "1. En Etkili Ağrı Kesici Tercihleri",
          body: "Diş ve diş eti kaynaklı akut ağrılarda hızlı emilen NSAİİ grubu ağrı kesiciler (Deksketoprofen - Arveles 25mg, Flurbiprofen - Majezik 100mg veya Naproksen - Apranax Fort) ilk tercihtir.",
          highlights: [
            "İlacı kesinlikle ağrıyan dişin üzerine koymayın veya ezmeyin (diş etini yakar ve kimyasal ülser yapar)",
            "İlaç bol su ile yutulmalı ve mide korunmalıdır",
            "Tuzlu ve ılık suyla ağzı çalkalamak lokal basıncı ve bakterileri hafifletir",
            "Başınızı yüksekte tutacak 2 yastıkla uyumayı tercih edin",
          ],
        },
      ],
    },
  },
  {
    id: "insulin-soguk-zincir",
    slug: "insulin-ve-asi-gibi-soguk-zincir-ilaclarin-saklanma-kurallari",
    title: "İnsülin, Aşı ve Göz Damlalarının Saklanması: Soğuk Zincir Kuralları (+2°C ile +8°C)",
    excerpt: "Açılmamış insülin buzdolabının neresinde saklanır? Kullanımdaki insülin kalemi oda sıcaklığında kaç gün dayanır? Seyahatte taşıma yöntemleri.",
    category: "İlaç Fiyat & Kullanım",
    readTime: "5 dk okuma",
    date: "18 Eylül 2026",
    keywords: ["insülin buzdolabında nasıl saklanır", "soğuk zincir ilaçlar", "insülin oda sıcaklığı", "bozulan aşı belirtileri"],
    content: {
      intro: "Protein ve peptid yapılı biyolojik ilaçlar (insülinler, aşılar, bazı göz damlaları ve biyobenzerler) ısı değişimlerine karşı son derece hassastır.",
      sections: [
        {
          heading: "1. Buzdolabında Saklama İlkeleri (+2°C ile +8°C)",
          body: "Yedek ve açılmamış insülinler buzdolabının orta raflarında saklanmalıdır. Asla buzluğa, dondurucuya veya buzdolabı kapağına konulmamalıdır (kapak sık açıldığından sıcaklık dalgalanır).",
          highlights: [
            "Donmuş İnsülin Çöptür: Asla çözdürüp kullanmayınız; moleküler yapısı bozulmuştur",
            "Kullanımdaki İnsülin Kalemi: Oda sıcaklığında (15-25°C) 28 gün boyunca güvenle saklanabilir",
            "Soğuk İğne Ağrı Yapar: Enjeksiyondan önce kalemin oda sıcaklığına gelmesi beklenmelidir",
          ],
        },
      ],
    },
  },
  {
    id: "mhrs-randevu-rehberi",
    slug: "mhrs-hastane-randevusu-nasil-alinir-e-devlet-alo-182",
    title: "MHRS Hastane Randevusu Nasıl Alınır? (ALO 182, e-Devlet ve Mobil)",
    excerpt: "Merkezi Hekim Randevu Sistemi (MHRS) üzerinden devlet ve şehir hastanelerine nasıl randevu alınır? ALO 182 arama adımları ve onaylı randevu sistemi.",
    category: "e-Devlet & MHRS",
    readTime: "4 dk okuma",
    date: "19 Eylül 2026",
    keywords: ["mhrs randevu alma", "alo 182", "hastane randevusu e devlet", "onaylı randevu dönemi"],
    content: {
      intro: "Sağlık Bakanlığı'na bağlı devlet hastaneleri, eğitim ve araştırma hastaneleri ile şehir hastanelerinden poliklinik randevusu almak için MHRS altyapısı kullanılır.",
      sections: [
        {
          heading: "1. e-Devlet veya MHRS Web / Mobil Üzerinden Randevu",
          body: "mhrs.gov.tr adresine girip 'e-Devlet ile Giriş' butonuna tıklayarak T.C. kimlik numaranız ve şifrenizle giriş yapabilirsiniz.",
        },
      ],
    },
  },
  {
    id: "enabiz-nasil-girilir",
    slug: "e-nabiz-sistemine-nasil-girilir-tahlil-ve-recete-sorgulama",
    title: "e-Nabız Sistemine Nasıl Girilir? Tahlil Sonuçları, Reçete ve Rapor Sorgulama",
    excerpt: "Sağlık geçmişiniz, kan tahlilleriniz, röntgen/MR sonuçlarınız ve geçmiş reçetelerinize e-Nabız üzerinden nasıl anında erişebilirsiniz?",
    category: "e-Devlet & MHRS",
    readTime: "4 dk okuma",
    date: "19 Eylül 2026",
    keywords: ["e-nabız giriş", "kan tahlil sonucu öğrenme", "e-reçete barkod", "ilaç kullanım raporu"],
    content: {
      intro: "e-Nabız, T.C. Sağlık Bakanlığı tarafından tüm vatandaşların sağlık verilerini tek bir güvenli panelde topladığı resmi kişisel sağlık kaydı sistemidir.",
      sections: [
        {
          heading: "e-Nabız'a Giriş Adımları",
          body: "enabiz.gov.tr adresine veya mobil uygulamaya e-Devlet Kapısı ile Giriş seçeneğini kullanarak bağlanabilirsiniz.",
        },
      ],
    },
  },
];

export default function Blog() {
  const [activeTab, setActiveTab] = useState<"fiyatlar" | "recete" | "agrikesici" | "rehber">("fiyatlar");
  const [searchTerm, setSearchTerm] = useState("");
  const [medicineCategory, setMedicineCategory] = useState<string>("Tümü");
  const [prescriptionFilter, setPrescriptionFilter] = useState<string>("Tümü");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const medicineCategories = [
    "Tümü",
    "Ağrı Kesici & Ateş Düşürücü",
    "Antibiyotik",
    "Mide Koruyucu & Antiasit",
    "Alerji & Antihistaminik",
    "Kalp & Tansiyon",
    "Diyabet & İnsülin",
    "Vitamin & Mineral",
    "Solunum & Astım",
    "Göz & Kulak Damlası",
  ];

  // Filtered medicines list for Price & Barcode database
  const filteredMedicines = useMemo(() => {
    return MEDICINES_DATABASE.filter((med) => {
      const matchCat = medicineCategory === "Tümü" || med.category === medicineCategory;
      const matchPresc = prescriptionFilter === "Tümü" || med.prescriptionType.includes(prescriptionFilter);
      const q = searchTerm.toLocaleLowerCase("tr-TR");
      const matchSearch =
        !searchTerm.trim() ||
        med.name.toLocaleLowerCase("tr-TR").includes(q) ||
        med.activeIngredient.toLocaleLowerCase("tr-TR").includes(q) ||
        med.barcode.includes(q) ||
        med.indications.toLocaleLowerCase("tr-TR").includes(q);

      return matchCat && matchPresc && matchSearch;
    });
  }, [medicineCategory, prescriptionFilter, searchTerm]);

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return ARTICLES_DATA;
    const q = searchTerm.toLocaleLowerCase("tr-TR");
    return ARTICLES_DATA.filter(
      (art) =>
        art.title.toLocaleLowerCase("tr-TR").includes(q) ||
        art.excerpt.toLocaleLowerCase("tr-TR").includes(q) ||
        art.keywords.some((k) => k.toLocaleLowerCase("tr-TR").includes(q))
    );
  }, [searchTerm]);

  const copyShareLink = (slug: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/#/blog#${slug}`);
    toast.success("Rehber bağlantısı panoya kopyalandı!");
  };

  return (
    <main className="pb-16 bg-gray-50/50 min-h-screen">
      
      {/* Üst Sekme Seçici - Sade, Hızlı ve Başlıksız */}
      <section className="bg-white border-b border-gray-200 py-4 px-4 sticky top-16 z-10 shadow-2xs">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("fiyatlar")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "fiyatlar"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <DollarSign size={16} />
              <span>İlaç Fiyatları & Barkod</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("recete")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "recete"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Tag size={16} />
              <span>Reçeteli / Reçetesiz İlaçlar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("agrikesici")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "agrikesici"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Pill size={16} />
              <span>Ağrı Kesiciler Tablosu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rehber")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "rehber"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BookOpen size={16} />
              <span>Sağlık & e-Devlet Rehberi</span>
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="İlaç, barkod veya konu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 pt-6">
        
        {/* 1. İLAÇ FİYATLARI VE BARKOD VERİTABANI */}
        {activeTab === "fiyatlar" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Kategori ve Filtre Çubuğu */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
                {medicineCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMedicineCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      medicineCategory === cat
                        ? "bg-red-600 text-white shadow-2xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-xs text-gray-500 font-bold">
                Toplam <strong>{filteredMedicines.length}</strong> ilaç listeleniyor
              </span>
            </div>

            {/* İlaç Fiyat Tablosu */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-red-600" />
                  <h2 className="text-base sm:text-lg font-black text-gray-900">
                    TİTCK & SGK MEDULA Resmi İlaç Fiyat Listesi (KDV Dahil)
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-gray-500">
                  Eylül 2026 Güncel Veri
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-gray-700 font-extrabold uppercase text-[11px]">
                      <th className="py-3 px-4">İlaç Adı & Üretici</th>
                      <th className="py-3 px-4">Barkod (GTIN) & Etken Madde</th>
                      <th className="py-3 px-4">Reçete Durumu</th>
                      <th className="py-3 px-4 text-right">Perakende Fiyatı (PSF)</th>
                      <th className="py-3 px-4 text-right">SGK Katkı Payı (~%10)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMedicines.map((med) => (
                      <tr key={med.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-gray-900 font-black text-sm block">{med.name}</strong>
                          <span className="text-[11px] text-gray-500">{med.manufacturer} · {med.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-gray-700 block">{med.barcode}</span>
                          <span className="text-[11px] text-gray-600">{med.activeIngredient}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            med.prescriptionType.includes("Reçetesiz")
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}>
                            {med.prescriptionType}
                          </span>
                          {med.isReimbursedBySGK && (
                            <span className="block text-[10px] font-bold text-emerald-700 mt-0.5">
                              ✓ SGK Geri Ödemeli
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-sm text-gray-900">
                          {med.publicSalePrice.toFixed(2)} ₺
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-xs text-red-700">
                          ~{med.patientCopayEstimated.toFixed(2)} ₺
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-50 text-xs text-gray-600 border-t border-gray-100 flex items-start gap-2">
                <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <span>
                  Fiyatlar Türkiye İlaç ve Tıbbi Cihaz Kurumu (TİTCK) resmi Fiyat Değerlendirme Komisyonu kararlarına ve SGK MEDULA eczane otomasyon sistemine uygundur. Reçeteli alımlarda SGK katkı payı emekliler için %10, çalışanlar için %20'dir.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. REÇETELİ VS REÇETESİZ İLAÇLAR KILAVUZU */}
        {activeTab === "recete" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Reçetesiz Serbest İlaçlar */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-emerald-800">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Reçetesiz (OTC) Serbest İlaçlar</h3>
                    <p className="text-xs text-gray-500">Doktor reçetesi olmadan eczaneden doğrudan temin edilebilir</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4 text-xs sm:text-sm">
                  {MEDICINES_DATABASE.filter((m) => m.prescriptionType.includes("Reçetesiz")).map((m) => (
                    <div key={m.id} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <div className="flex justify-between items-start">
                        <strong className="font-black text-gray-900">{m.name}</strong>
                        <span className="font-mono font-black text-emerald-800">{m.publicSalePrice.toFixed(2)} ₺</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{m.indications}</p>
                      <span className="text-[11px] font-semibold text-emerald-900 mt-1 block">
                        ✓ {m.usageInstructions}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reçeteye Tabi İlaçlar */}
              <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-amber-800">
                  <AlertTriangle size={24} className="text-amber-600" />
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Reçeteli (Zorunlu) İlaçlar</h3>
                    <p className="text-xs text-gray-500">Yasal zorunluluk: Yalnızca hekim reçetesiyle verilebilir</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4 text-xs sm:text-sm">
                  {MEDICINES_DATABASE.filter((m) => !m.prescriptionType.includes("Reçetesiz")).map((m) => (
                    <div key={m.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                      <div className="flex justify-between items-start">
                        <strong className="font-black text-gray-900">{m.name}</strong>
                        <span className="font-mono font-black text-amber-900">{m.publicSalePrice.toFixed(2)} ₺</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{m.indications}</p>
                      <span className="text-[11px] font-semibold text-amber-950 mt-1 block">
                        ⚠️ {m.prescriptionWarning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. AĞRI KESİCİLER KARŞILAŞTIRMA TABLOSU */}
        {activeTab === "agrikesici" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-50 text-red-600 font-bold">
                  <Pill size={24} />
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                    Sık Kullanılan Ağrı Kesiciler Karşılaştırma Rehberi
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Markalar, Etken Maddeler, Ne Zaman Alınır, Mideye Etkisi ve Yaklaşık Fiyat Aralıkları
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <AlertTriangle size={14} className="text-amber-600" />
                Doktor & Eczacı Danışımı Önerilir
              </span>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-gray-700 font-extrabold uppercase text-[11px]">
                    <th className="py-3 px-4">İlaç / Marka</th>
                    <th className="py-3 px-4">Etken Madde & Tür</th>
                    <th className="py-3 px-4">Kullanım Alanı</th>
                    <th className="py-3 px-4">Mideye Etkisi / Aç-Tok</th>
                    <th className="py-3 px-4 whitespace-nowrap">Resmi Eşdeğer Bant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PAINKILLER_GUIDE.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-gray-900 text-sm">
                        {p.brand}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        <strong className="text-gray-900 block font-bold">{p.activeIngredient}</strong>
                        <span className="text-[10px] text-gray-500">{p.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 max-w-xs font-medium">
                        {p.indications}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        <span className="font-semibold text-gray-900 block">{p.usageAdvice}</span>
                        <span className="text-[11px] text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                          {p.stomachEffect}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg text-xs">
                          {p.priceRange}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. SAĞLIK & E-DEVLET MAKALELERİ */}
        {activeTab === "rehber" && (
          <div className="space-y-6 animate-fadeIn">
            {filteredArticles.map((article) => {
              const isExpanded = expandedArticle === article.id;

              return (
                <article
                  key={article.id}
                  id={article.slug}
                  className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs hover:border-gray-300 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                      {article.category}
                    </span>

                    <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} /> {article.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {article.readTime}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug mb-3">
                    {article.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {article.excerpt}
                  </p>

                  {/* Detaylı Açılır İçerik */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-6 animate-fadeIn">
                      <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 text-sm font-semibold text-gray-800 leading-relaxed">
                        {article.content.intro}
                      </div>

                      {article.content.sections.map((sec, sIdx) => (
                        <div key={sIdx} className="space-y-2">
                          <h4 className="text-base font-black text-gray-900">
                            {sec.heading}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                            {sec.body}
                          </p>
                          {sec.highlights && (
                            <ul className="mt-2 space-y-1.5 pl-2">
                              {sec.highlights.map((h, hIdx) => (
                                <li key={hIdx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-800 font-medium">
                                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}

                      {article.content.faq && article.content.faq.length > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl space-y-3">
                          <h4 className="text-xs font-black uppercase text-gray-500">
                            Sıkça Sorulan Sorular:
                          </h4>
                          {article.content.faq.map((f, fIdx) => (
                            <div key={fIdx} className="space-y-1">
                              <p className="text-xs sm:text-sm font-bold text-gray-900">
                                S: {f.q}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                C: {f.a}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Alt Aksiyon Çubuğu */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                      className="button button-secondary text-xs font-black inline-flex items-center gap-1.5 py-2 px-3 rounded-xl cursor-pointer"
                    >
                      <span>{isExpanded ? "Rehberi Kapat" : "Detaylı Rehberi Oku"}</span>
                      <ArrowRight size={14} className={isExpanded ? "rotate-90 transition-transform" : ""} />
                    </button>

                    <button
                      type="button"
                      onClick={() => copyShareLink(article.slug)}
                      className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 text-xs font-bold flex items-center gap-1"
                      title="Bağlantıyı Paylaş"
                    >
                      <Share2 size={14} /> Paylaş
                    </button>
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
