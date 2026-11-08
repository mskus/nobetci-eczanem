import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  MapPin,
  CheckCircle2,
  Share2,
  Pill,
  AlertTriangle,
  Info,
  DollarSign,
  Tag,
  HeartPulse,
  Building2,
  Calculator,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { MEDICINES_DATABASE } from "@/lib/medicineData";
import { PAINKILLER_GUIDE } from "@/lib/painkillerData";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category:
    | "Nöbetçi Eczane & Mevzuat"
    | "Hastane & Acil Servis"
    | "İlaç Fiyat & SGK"
    | "Acil Sağlık & Çocuk"
    | "e-Devlet & MHRS";
  readTime: string;
  date: string;
  accentColor: string;
  relatedRoute: { href: string; label: string };
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
    id: "nobetci-eczane-saatleri-kurallari",
    slug: "nobetci-eczane-saat-kaca-kadar-acik-gece-ve-pazar-nobet-kurallari",
    title: "Nöbetçi Eczane Saat Kaça Kadar Açık? Gece, Pazar ve Resmi Tatil Nöbet Kuralları (2026)",
    excerpt:
      "Nöbetçi eczaneler akşam saat kaçta başlar ve sabah kaça kadar açıktır? Gece nöbetçi eczanede fiyat farkı var mı? Raporlu ve e-reçeteli ilaç temini rehberi.",
    category: "Nöbetçi Eczane & Mevzuat",
    readTime: "5 dk okuma",
    date: "20 Eylül 2026",
    accentColor: "from-red-600 to-rose-700",
    relatedRoute: { href: "/", label: "En Yakın Nöbetçi Eczaneyi Bul" },
    keywords: [
      "nöbetçi eczane kaça kadar açık",
      "nöbetçi eczane saatleri",
      "pazar günü açık eczane",
      "gece açık nöbetçi eczane",
      "nöbetçi eczane fiyat farkı",
    ],
    content: {
      intro:
        "Türkiye'de 6197 sayılı Eczacılar ve Eczaneler Hakkında Kanun ile Türk Eczacıları Birliği (TEB) yönetmelikleri uyarınca, vatandaşların 7 gün 24 saat kesintisiz ilaca erişebilmesi için her ilçede nüfus yoğunluğuna göre nöbetçi eczaneler görevlendirilir.",
      sections: [
        {
          heading: "1. Nöbetçi Eczane Çalışma Saatleri (Akşam 19:00 – Sabah 09:00)",
          body: "Normal eczaneler hafta içi ve cumartesi günleri akşam 18:30 - 19:00 saatlerinde kapanır. Nöbetçi eczaneler ise mesai bitiminden başlayarak ertesi gün sabah saat 09:00'a kadar kesintisiz hizmet verir. Pazar günleri, bayramlarda ve resmi tatillerde ise nöbetçi eczaneler sabah 09:00'dan ertesi sabah 09:00'a kadar tam 24 saat açıktır.",
          highlights: [
            "Gece 24:00'ten (00:00) sonra gittiğinizde, bir önceki akşam nöbete başlayan eczane sabah 09:00'a kadar açık kalmaya devam eder",
            "Gece geç saatlerde eczaneler güvenlik amacıyla kepenk arkasındaki 'Gece Nöbet Penceresi' (Zil) üzerinden hizmet verebilir",
            "Nöbetçi eczanelerde kesinlikle ekstra gece tarifesi veya nöbet ücreti uygulanmaz",
          ],
        },
        {
          heading: "2. Nöbetçi Eczaneden Hangi İlaçlar Alınabilir?",
          body: "Acil servis doktorlarının yazdığı e-reçeteler, kronik hastaların raporlu ilaçları, bebek mamaları, ateş düşürücüler, ağrı kesiciler ve medikal ilk yardım malzemeleri nöbetçi eczanelerden temin edilebilir.",
        },
      ],
      faq: [
        {
          q: "Sabah saat 04:00'te hangi günün nöbetçi eczanesine gitmeliyim?",
          a: "Nöbet vardiyası sabah 09:00'da değişir. Sistemimiz saat 00:00 - 09:00 arasında otomatik olarak o an açık olan nöbetçi eczaneleri 'Bugün Açık' sekmesinde gösterir.",
        },
      ],
    },
  },
  {
    id: "en-yakin-hastane-acil-servis-rehberi",
    slug: "en-yakin-hastane-acil-servis-yesil-sari-kirmizi-alan-ve-asm-rehberi",
    title: "En Yakın Hastane, 7/24 Acil Servis (Yeşil, Sarı, Kırmızı Alan) ve Sağlık Ocağı Rehberi",
    excerpt:
      "Acil serviste yeşil, sarı ve kırmızı alan ne anlama gelir? Devlet ve şehir hastanelerinde acil muayene ücreti var mı? Aile Sağlığı Merkezi (ASM) çalışma saatleri.",
    category: "Hastane & Acil Servis",
    readTime: "6 dk okuma",
    date: "20 Eylül 2026",
    accentColor: "from-rose-600 to-red-800",
    relatedRoute: { href: "/en-yakin-hastane", label: "En Yakın Hastane & ASM Haritası" },
    keywords: [
      "en yakın hastane",
      "en yakın acil servis",
      "en yakın sağlık ocağı",
      "acil servis yeşil alan ücreti",
      "aile sağlığı merkezi saatleri",
    ],
    content: {
      intro:
        "Acil sağlık ihtiyaçlarında doğru sağlık kuruluşuna başvurmak hem müdahale süresini kısaltır hem de tedavi etkinliğini artırır. Türkiye'de Şehir Hastaneleri, Eğitim ve Araştırma Hastaneleri ile Devlet Hastaneleri 7/24 acil servis hizmeti sunar.",
      sections: [
        {
          heading: "1. Acil Servis Triyaj Sistemi (Kırmızı, Sarı ve Yeşil Alan)",
          body: "Hastane acil servislerine başvuran hastalar, aciliyet derecesine göre triyaj hemşiresi ve hekimi tarafından 3 ana alana yönlendirilir:",
          highlights: [
            "Kırmızı Alan: Kalp krizi, solunum durması, ağır travma, felç ve bilinç kaybı gibi saniyelerin hayati olduğu durumlar (Anında müdahale, tamamen ücretsiz)",
            "Sarı Alan: Yüksek ateş, şiddetli karın/böğür ağrısı, kırık şüphesi, astım atağı ve serum/iğne müdahalesi gerektiren orta-ağır tablolar",
            "Yeşil Alan: Hafif soğuk algınlığı, kronik ağrılar ve ayaktan reçete yazılabilecek acil olmayan durumlar",
          ],
        },
        {
          heading: "2. Aile Sağlığı Merkezleri (Sağlık Ocakları) ve Sağlık Kabinleri",
          body: "Kayıtlı olduğunuz Aile Sağlığı Merkezi (ASM) hafta içi 08:00 - 17:00 saatleri arasında ücretsiz muayene, kan tahlili, bebek/çocuk aşısı ve raporlu ilaç reçeteleme hizmeti verir. Mesai saatleri dışında reçeteli iğne (enjeksiyon), pansuman ve serum işlemleri için nöbetçi sağlık kabinleri veya hastane acil servisleri tercih edilebilir.",
        },
      ],
    },
  },
  {
    id: "sgk-ilac-katki-payi-hesaplama-rehberi",
    slug: "sgk-ilac-katki-payi-muayene-ucreti-ve-esdeger-ilac-farki-nasil-hesaplanir",
    title: "SGK İlaç Katkı Payı, Muayene Ücreti ve Eşdeğer İlaç Farkı Nasıl Hesaplanır? (2026)",
    excerpt:
      "Eczanede ilaç alırken neden fiyat farkı çıkar? Çalışan (%20) ve emekli (%10) SGK katkı payı oranları, muayene katılım payları ve raporlu ilaç muafiyeti.",
    category: "İlaç Fiyat & SGK",
    readTime: "5 dk okuma",
    date: "19 Eylül 2026",
    accentColor: "from-emerald-600 to-teal-800",
    relatedRoute: { href: "/sgk-katki-payi-hesaplayici", label: "SGK Katkı Payı Hesaplama Aracı" },
    keywords: [
      "sgk ilaç katkı payı hesaplama",
      "eczanede muayene ücreti",
      "eşdeğer ilaç fiyat farkı",
      "emekli ilaç kesintisi yüzde kaç",
    ],
    content: {
      intro:
        "Sosyal Güvenlik Kurumu (SGK) Sağlık Uygulama Tebliği (SUT) kurallarına göre, reçeteyle alınan ilaçlarda sigortalının statüsüne göre belirli oranlarda katılım payı ve muayene ücreti tahsil edilir.",
      sections: [
        {
          heading: "1. Çalışan (%20) ve Emekli (%10) İlaç Katkı Payı",
          body: "Aktif çalışan sigortalılar (4A, 4B, 4C) ve bakmakla yükümlü oldukları kişiler reçetedeki ilaç bedelinin %20'sini eczanede nakit/kartla öder. Emeklilerde ise bu oran %10'dur ve maaşlarından kesilir.",
          highlights: [
            "Reçete Katılım Payı: 3 kutuya kadar (3 kutu dahil) sabit 3 TL, ilave her bir kutu için +1 TL eklenir",
            "Raporlu (Kronik) İlaçlar: Hasta muafiyet raporu varsa %10 veya %20 ilaç katkı payı alınmaz (Ancak eşdeğer taban fiyat farkı varsa çıkabilir)",
            "Eşdeğer (Muadil) Farkı: SGK aynı etken maddeli ilaçlar içinde en ucuz taban fiyatı baz alır; tercih edilen marka bu bandın üzerindeyse aradaki fark hastadan tahsil edilir",
          ],
        },
      ],
    },
  },
  {
    id: "receteli-recetesiz-rehber",
    slug: "hangi-ilaclar-receteli-hangi-ilaclar-recetesiz-satilir",
    title: "Hangi İlaçlar Reçeteli, Hangileri Reçetesiz (OTC) Satılır? 2026 Mevzuat Rehberi",
    excerpt:
      "Antibiyotikler neden reçetesiz satılamaz? Reçetesiz alınabilen ağrı kesiciler, vitaminler, kremler ve SGK geri ödeme kapsamındaki kurallar.",
    category: "Nöbetçi Eczane & Mevzuat",
    readTime: "5 dk okuma",
    date: "19 Eylül 2026",
    accentColor: "from-amber-600 to-orange-700",
    relatedRoute: { href: "/ilac-etkilesim", label: "İlaç & Besin Etkileşim Testi" },
    keywords: [
      "reçetesiz satılan ilaçlar",
      "reçeteli ilaçlar listesi",
      "otc ilaçlar",
      "antibiyotik reçetesiz alınır mı",
    ],
    content: {
      intro:
        "Türkiye'de 1262 sayılı İspençiyari ve Tıbbi Müstahzarlar Kanunu ve Sağlık Bakanlığı TİTCK mevzuatına göre ilaçlar reçete zorunluluğuna göre sınıflara ayrılır.",
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
            "Tüm Sistemik Antibiyotikler ve Antifungaller (Reçetesiz satılması yasal olarak yasaktır)",
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
    excerpt:
      "Parasetamol ve İbuprofen şuruplar kaç ölçek verilmeli? Kilo başına miligram hesabı, dönüşümlü ateş düşürücü verme kuralları ve acil uyarılar.",
    category: "Acil Sağlık & Çocuk",
    readTime: "6 dk okuma",
    date: "19 Eylül 2026",
    accentColor: "from-blue-600 to-indigo-700",
    relatedRoute: { href: "/ilk-yardim", label: "7/24 Acil İlk Yardım Rehberi" },
    keywords: [
      "çocuklarda ateş düşürücü doz",
      "parol şurup kaç ölçek",
      "calpol dolven dönüşümlü",
      "bebeklerde ateş 38.5",
    ],
    content: {
      intro:
        "Çocuklarda ateş düşürücü verirken çocuğun yaşı değil, vücut ağırlığı (kilosu) esas alınmalıdır. Yanlış doz vermek yetersiz tedaviye veya karaciğer/böbrek yüküne yol açabilir.",
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
      ],
    },
  },
  {
    id: "gece-dis-agrisi-cozum",
    slug: "gece-aniden-baslayan-dis-agrisina-acil-cozum-ve-ilac-rehberi",
    title: "Gece Aniden Başlayan Zonklayıcı Diş Ağrısına Acil Müdahale & Nöbetçi Eczane İlaçları",
    excerpt:
      "Gece uykudan uyandıran iltihaplı diş ağrısına hangi ağrı kesici iyi gelir? Gargara, karanfil yağı ve nöbetçi diş hastanesi / eczane çözümleri.",
    category: "Acil Sağlık & Çocuk",
    readTime: "4 dk okuma",
    date: "18 Eylül 2026",
    accentColor: "from-purple-600 to-indigo-800",
    relatedRoute: { href: "/", label: "Açık Nöbetçi Eczaneleri Gör" },
    keywords: [
      "gece diş ağrısı",
      "diş ağrısına hangi ağrı kesici",
      "arveles diş ağrısı",
      "24 saat açık nöbetçi eczane",
    ],
    content: {
      intro:
        "Gece yatay pozisyona geçildiğinde baş bölgesindeki kan basıncının artması, diş pulpası içindeki iltihabın şiddetli zonklamasına neden olur.",
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
    excerpt:
      "Açılmamış insülin buzdolabının neresinde saklanır? Kullanımdaki insülin kalemi oda sıcaklığında kaç gün dayanır? Seyahatte taşıma yöntemleri.",
    category: "İlaç Fiyat & SGK",
    readTime: "5 dk okuma",
    date: "18 Eylül 2026",
    accentColor: "from-cyan-600 to-blue-800",
    relatedRoute: { href: "/titck-ilac-geri-cekme", label: "TİTCK İlaç Güvenlik Bülteni" },
    keywords: [
      "insülin buzdolabında nasıl saklanır",
      "soğuk zincir ilaçlar",
      "insülin oda sıcaklığı",
      "bozulan aşı belirtileri",
    ],
    content: {
      intro:
        "Protein ve peptid yapılı biyolojik ilaçlar (insülinler, aşılar, bazı göz damlaları ve biyobenzerler) ısı değişimlerine karşı son derece hassastır.",
      sections: [
        {
          heading: "1. Buzdolabında Saklama İlkeleri (+2°C ile +8°C)",
          body: "Yedek ve açılmamış insülinler buzdolabının orta raflarında saklanmalıdır. Asla buzluğa, dondurucuya veya buzdolabı kapağına konulmamalıdır.",
          highlights: [
            "Donmuş İnsülin Kullanılmaz: Asla çözdürüp kullanmayınız; moleküler yapısı bozulmuştur",
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
    title: "MHRS Hastane Randevusu Nasıl Alınır? (ALO 182, e-Devlet ve Onaylı Randevu Sistemi)",
    excerpt:
      "Merkezi Hekim Randevu Sistemi (MHRS) üzerinden devlet ve şehir hastanelerine nasıl randevu alınır? ALO 182 arama adımları ve saat 20:00 onay kuralı.",
    category: "e-Devlet & MHRS",
    readTime: "4 dk okuma",
    date: "19 Eylül 2026",
    accentColor: "from-slate-700 to-slate-900",
    relatedRoute: { href: "/en-yakin-hastane", label: "Hastane Adres & Telefonları" },
    keywords: [
      "mhrs randevu alma",
      "alo 182",
      "hastane randevusu e devlet",
      "onaylı randevu dönemi",
    ],
    content: {
      intro:
        "Sağlık Bakanlığı'na bağlı devlet hastaneleri, eğitim ve araştırma hastaneleri ile şehir hastanelerinden poliklinik randevusu almak için MHRS altyapısı kullanılır.",
      sections: [
        {
          heading: "1. e-Devlet veya MHRS Mobil Üzerinden Randevu ve Onay Kuralı",
          body: "mhrs.gov.tr adresine girip 'e-Devlet ile Giriş' butonuna tıklayarak T.C. kimlik numaranızla randevu oluşturabilirsiniz. Randevu gününden bir önceki gün saat 20:00'ye kadar randevunuzu onaylamanız veya gelemeyecekseniz iptal etmeniz gerekmektedir.",
        },
      ],
    },
  },
  {
    id: "enabiz-nasil-girilir",
    slug: "e-nabiz-sistemine-nasil-girilir-tahlil-ve-recete-sorgulama",
    title: "e-Nabız Sistemine Nasıl Girilir? Kan Tahlili Sonuçları, e-Reçete ve Rapor Sorgulama",
    excerpt:
      "Sağlık geçmişiniz, kan tahlilleriniz, röntgen/MR sonuçlarınız ve e-reçete kodunuza e-Nabız üzerinden nasıl anında erişebilirsiniz?",
    category: "e-Devlet & MHRS",
    readTime: "4 dk okuma",
    date: "19 Eylül 2026",
    accentColor: "from-teal-600 to-emerald-800",
    relatedRoute: { href: "/tum-eczaneler", label: "81 İl Tüm Eczaneler Rehberi" },
    keywords: [
      "e-nabız giriş",
      "kan tahlil sonucu öğrenme",
      "e-reçete barkod",
      "ilaç kullanım raporu",
    ],
    content: {
      intro:
        "e-Nabız, T.C. Sağlık Bakanlığı tarafından tüm vatandaşların sağlık verilerini tek bir güvenli panelde topladığı resmi kişisel sağlık kaydı sistemidir.",
      sections: [
        {
          heading: "e-Nabız'da Reçete ve Rapor Görüntüleme",
          body: "enabiz.gov.tr adresine e-Devlet şifrenizle giriş yaptıktan sonra 'Reçetelerim' sekmesinden hekiminizin yazdığı e-reçete numarasını görebilir ve nöbetçi eczaneden ilaçlarınızı alabilirsiniz.",
        },
      ],
    },
  },
];

export default function Blog() {
  const [activeTab, setActiveTab] = useState<"rehber" | "fiyatlar" | "recete" | "agrikesici">(
    "rehber"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [medicineCategory, setMedicineCategory] = useState<string>("Tümü");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(
    "nobetci-eczane-saatleri-kurallari"
  );

  useEffect(() => {
    const tabTitles = {
      rehber: "Sağlık, Nöbetçi Eczane, Hastane & İlaç Rehberi (Blog) | Nöbetçi Eczanem",
      fiyatlar: "2026 Güncel İlaç Fiyatları, Barkod (GTIN) & SGK Katkı Payı Listesi | Nöbetçi Eczanem",
      recete: "Reçeteli ve Reçetesiz (OTC) Satılan İlaçlar Listesi | Nöbetçi Eczanem",
      agrikesici: "Sık Kullanılan Ağrı Kesiciler Karşılaştırma Tablosu | Nöbetçi Eczanem",
    };
    document.title = tabTitles[activeTab];
  }, [activeTab]);

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

  const filteredMedicines = useMemo(() => {
    return MEDICINES_DATABASE.filter((med) => {
      const matchCat = medicineCategory === "Tümü" || med.category === medicineCategory;
      const q = searchTerm.toLocaleLowerCase("tr-TR");
      const matchSearch =
        !searchTerm.trim() ||
        med.name.toLocaleLowerCase("tr-TR").includes(q) ||
        med.activeIngredient.toLocaleLowerCase("tr-TR").includes(q) ||
        med.barcode.includes(q) ||
        med.indications.toLocaleLowerCase("tr-TR").includes(q);

      return matchCat && matchSearch;
    });
  }, [medicineCategory, searchTerm]);

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
    navigator.clipboard?.writeText(`${window.location.origin}/blog#${slug}`);
    toast.success("Rehber bağlantısı panoya kopyalandı!");
  };

  return (
    <main className="pb-20 bg-slate-50 min-h-screen">
      {/* Üst Sekme Seçici - Mobil Uyumlu 2x2 Grid / Masaüstü Yatay */}
      <section className="bg-white border-b border-slate-200 py-3.5 px-3 sm:px-4 sticky top-[60px] lg:top-[68px] z-20 shadow-2xs">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("rehber")}
              className={`min-h-11 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "rehber"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <BookOpen size={15} className="shrink-0" />
              <span className="truncate">Sağlık & Blog Yazıları</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("fiyatlar")}
              className={`min-h-11 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "fiyatlar"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <DollarSign size={15} className="shrink-0" />
              <span className="truncate">İlaç Fiyatları & Barkod</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("recete")}
              className={`min-h-11 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "recete"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Tag size={15} className="shrink-0" />
              <span className="truncate">Reçeteli / Reçetesiz</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("agrikesici")}
              className={`min-h-11 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "agrikesici"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Pill size={15} className="shrink-0" />
              <span className="truncate">Ağrı Kesiciler Tablosu</span>
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Makale, ilaç veya barkod ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-9 pr-3 text-xs sm:text-sm font-bold border-2 border-slate-300 rounded-xl focus:outline-none focus:border-red-600 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-3 sm:px-4 pt-5">
        {/* 1. SAĞLIK, NÖBETÇİ ECZANE & E-DEVLET BLOG YAZILARI (SEO MAKALELERİ) */}
        {activeTab === "rehber" && (
          <div className="space-y-6">
            {/* Görsel Hero Blog Başlığı */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-extrabold border border-red-200">
                  <ShieldCheck size={14} /> GÜNCEL SAĞLIK & MEVZUAT KÜTÜPHANESİ
                </span>
                <h1 className="text-xl sm:text-3xl font-black text-slate-900">
                  Nöbetçi Eczane, Acil Hastane ve İlaç Kullanım Rehberi
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  T.C. Sağlık Bakanlığı TİTCK, SGK MEDULA ve Türk Eczacıları Birliği mevzuatlarına
                  uygun olarak hazırlanan doğrulanmış hasta bilgilendirme rehberleri.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto">
                <Link
                  href="/"
                  className="flex-1 md:flex-initial button button-primary text-xs py-2.5 px-4 rounded-xl"
                >
                  <MapPin size={14} /> Nöbetçi Eczaneler
                </Link>
                <Link
                  href="/en-yakin-hastane"
                  className="flex-1 md:flex-initial button button-secondary text-xs py-2.5 px-4 rounded-xl"
                >
                  <Building2 size={14} /> En Yakın Hastane
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {filteredArticles.map((article, idx) => {
                const isExpanded = expandedArticle === article.id;

                return (
                  <article
                    key={article.id}
                    id={article.slug}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                  >
                    {/* Görsel Renkli Üst Şerit */}
                    <div
                      className={`bg-gradient-to-r ${article.accentColor} px-5 py-3 text-white flex flex-wrap items-center justify-between gap-2`}
                    >
                      <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md">
                        #{idx + 1} · {article.category}
                      </span>
                      <div className="flex items-center gap-3 text-xs font-bold text-white/90">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {article.date}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> {article.readTime}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-7">
                      <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug mb-2.5">
                        {article.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                        {article.excerpt}
                      </p>

                      {/* SEO Anahtar Kelime Etiketleri */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {article.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>

                      {/* Detaylı Açılır İçerik */}
                      {isExpanded && (
                        <div className="mt-5 pt-5 border-t border-slate-100 space-y-5">
                          <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                            {article.content.intro}
                          </div>

                          {article.content.sections.map((sec, sIdx) => (
                            <div key={sIdx} className="space-y-2">
                              <h3 className="text-sm sm:text-base font-black text-slate-900">
                                {sec.heading}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                {sec.body}
                              </p>
                              {sec.highlights && (
                                <ul className="mt-2 space-y-1.5 pl-1">
                                  {sec.highlights.map((h, hIdx) => (
                                    <li
                                      key={hIdx}
                                      className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 font-medium"
                                    >
                                      <CheckCircle2
                                        size={15}
                                        className="text-emerald-600 shrink-0 mt-0.5"
                                      />
                                      <span>{h}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}

                          {article.content.faq && article.content.faq.length > 0 && (
                            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                              <h4 className="text-xs font-black uppercase text-slate-500">
                                Sıkça Sorulan Sorular:
                              </h4>
                              {article.content.faq.map((f, fIdx) => (
                                <div key={fIdx} className="space-y-1">
                                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                                    S: {f.q}
                                  </p>
                                  <p className="text-xs sm:text-sm text-slate-600">C: {f.a}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Alt Aksiyon ve İç Link Çubuğu */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                            className="min-h-10 button button-secondary text-xs font-black inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl cursor-pointer"
                          >
                            <span>{isExpanded ? "Yazıyı Daralt" : "Tamamını Oku"}</span>
                            <ArrowRight
                              size={14}
                              className={isExpanded ? "rotate-90 transition-transform" : ""}
                            />
                          </button>

                          <Link
                            href={article.relatedRoute.href}
                            className="min-h-10 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold inline-flex items-center gap-1.5"
                          >
                            <span>{article.relatedRoute.label}</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyShareLink(article.slug)}
                          className="min-h-10 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          title="Bağlantıyı Paylaş"
                        >
                          <Share2 size={14} /> Paylaş
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. İLAÇ FİYATLARI VE BARKOD VERİTABANI (Mobil Kart + Masaüstü Tablo) */}
        {activeTab === "fiyatlar" && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {medicineCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMedicineCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      medicineCategory === cat
                        ? "bg-red-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-500 font-bold">
                Toplam <strong>{filteredMedicines.length}</strong> ilaç listeleniyor
              </span>
            </div>

            {/* Mobil Görünüm: Kaydırma Gerektirmeyen Kartlar */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredMedicines.map((med) => (
                <div
                  key={med.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-slate-900 font-black text-sm block">
                        {med.name}
                      </strong>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {med.activeIngredient} · {med.manufacturer}
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 shrink-0">
                      {med.publicSalePrice.toFixed(2)} ₺
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="font-mono text-[11px] text-slate-600">
                      Barkod: {med.barcode}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        med.prescriptionType.includes("Reçetesiz")
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {med.prescriptionType}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Masaüstü Tablo Görünümü */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-red-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    TİTCK & SGK MEDULA Resmi İlaç Fiyat Listesi (KDV Dahil)
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-500">2026 Güncel Veri</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-700 font-extrabold uppercase text-[11px]">
                      <th className="py-3 px-4">İlaç Adı & Üretici</th>
                      <th className="py-3 px-4">Barkod (GTIN) & Etken Madde</th>
                      <th className="py-3 px-4">Reçete Durumu</th>
                      <th className="py-3 px-4 text-right">Perakende Fiyatı (PSF)</th>
                      <th className="py-3 px-4 text-right">SGK Katkı Payı (~%10)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMedicines.map((med) => (
                      <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 font-black text-sm block">
                            {med.name}
                          </strong>
                          <span className="text-[11px] text-slate-500">
                            {med.manufacturer} · {med.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-700 block">
                            {med.barcode}
                          </span>
                          <span className="text-[11px] text-slate-600">
                            {med.activeIngredient}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              med.prescriptionType.includes("Reçetesiz")
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : "bg-amber-100 text-amber-900 border border-amber-300"
                            }`}
                          >
                            {med.prescriptionType}
                          </span>
                          {med.isReimbursedBySGK && (
                            <span className="block text-[10px] font-bold text-emerald-700 mt-0.5">
                              ✓ SGK Geri Ödemeli
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-sm text-slate-900">
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

              <div className="p-4 bg-slate-50 text-xs text-slate-600 border-t border-slate-100 flex items-start gap-2">
                <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Fiyatlar Türkiye İlaç ve Tıbbi Cihaz Kurumu (TİTCK) resmi Fiyat Değerlendirme
                  Komisyonu kararlarına ve SGK MEDULA eczane otomasyon sistemine uygundur.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. REÇETELİ VS REÇETESİZ İLAÇLAR KILAVUZU */}
        {activeTab === "recete" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 text-emerald-800">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Reçetesiz (OTC) Serbest İlaçlar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Doktor reçetesi olmadan eczaneden doğrudan temin edilebilir
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4 text-xs sm:text-sm">
                {MEDICINES_DATABASE.filter((m) => m.prescriptionType.includes("Reçetesiz")).map(
                  (m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <strong className="font-black text-slate-900">{m.name}</strong>
                        <span className="font-mono font-black text-emerald-800 shrink-0">
                          {m.publicSalePrice.toFixed(2)} ₺
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{m.indications}</p>
                      <span className="text-[11px] font-semibold text-emerald-900 mt-1 block">
                        ✓ {m.usageInstructions}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 text-amber-800">
                <AlertTriangle size={24} className="text-amber-600 shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Reçeteli (Zorunlu) İlaçlar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Yasal zorunluluk: Yalnızca hekim reçetesiyle verilebilir
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4 text-xs sm:text-sm">
                {MEDICINES_DATABASE.filter((m) => !m.prescriptionType.includes("Reçetesiz")).map(
                  (m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-amber-50/60 rounded-xl border border-amber-100"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <strong className="font-black text-slate-900">{m.name}</strong>
                        <span className="font-mono font-black text-amber-900 shrink-0">
                          {m.publicSalePrice.toFixed(2)} ₺
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{m.indications}</p>
                      <span className="text-[11px] font-semibold text-amber-950 mt-1 block">
                        ⚠️ {m.prescriptionWarning}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. AĞRI KESİCİLER KARŞILAŞTIRMA TABLOSU (Mobil Kart + Masaüstü Tablo) */}
        {activeTab === "agrikesici" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-red-50 text-red-600 font-bold shrink-0">
                    <Pill size={22} />
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                      Sık Kullanılan Ağrı Kesiciler Karşılaştırma Rehberi
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Markalar, Etken Maddeler, Mideye Etkisi ve Yaklaşık Fiyat Aralıkları
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 self-start md:self-auto">
                  <AlertTriangle size={14} className="text-amber-600" />
                  Eczacı Danışımı Önerilir
                </span>
              </div>
            </div>

            {/* Mobil Kart Görünümü */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {PAINKILLER_GUIDE.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">{p.brand}</strong>
                      <span className="text-xs font-bold text-slate-600">
                        {p.activeIngredient} ({p.category})
                      </span>
                    </div>
                    <span className="font-mono font-black text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg shrink-0">
                      {p.priceRange}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{p.indications}</p>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-slate-800">{p.usageAdvice}</span>
                    <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-semibold">
                      {p.stomachEffect}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Masaüstü Tablo Görünümü */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-700 font-extrabold uppercase text-[11px]">
                      <th className="py-3 px-4">İlaç / Marka</th>
                      <th className="py-3 px-4">Etken Madde & Tür</th>
                      <th className="py-3 px-4">Kullanım Alanı</th>
                      <th className="py-3 px-4">Mideye Etkisi / Aç-Tok</th>
                      <th className="py-3 px-4 whitespace-nowrap">Resmi Eşdeğer Bant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PAINKILLER_GUIDE.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">{p.brand}</td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <strong className="text-slate-900 block font-bold">
                            {p.activeIngredient}
                          </strong>
                          <span className="text-[10px] text-slate-500">{p.category}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-xs font-medium">
                          {p.indications}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-semibold text-slate-900 block">
                            {p.usageAdvice}
                          </span>
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
          </div>
        )}
      </div>
    </main>
  );
}
