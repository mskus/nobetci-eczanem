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
} from "lucide-react";
import { PageIntro } from "@/components/SiteLayout";
import { toast } from "sonner";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Mevzuat & Saatler" | "SGK & e-Reçete" | "Acil Sağlık" | "Şehir Rehberleri";
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
    id: "1",
    slug: "nobetci-eczane-calisma-saatleri-ve-nobet-devir-sistemi",
    title: "2026 Nöbetçi Eczane Çalışma Saatleri ve Nöbet Devir Sistemi",
    excerpt: "Nöbetçi eczaneler kaça kadar açık? Sabah nöbet devir saati kaçtır? Hafta sonu ve bayramlarda nöbet kuralları hakkında kapsamlı rehber.",
    category: "Mevzuat & Saatler",
    readTime: "4 dk okuma",
    date: "19 Eylül 2026",
    keywords: ["nöbetçi eczane çalışma saatleri", "nöbet devir saati", "nöbetçi eczaneler kaça kadar açık", "sabah 09:00 nöbet"],
    content: {
      intro: "Türkiye'de 6197 sayılı Eczacılar ve Eczaneler Hakkında Kanun uyarınca, halkın kesintisiz ilaç erişimini sağlamak için nöbetçi eczane sistemi uygulanır. Normal çalışma saatlerinin sona erdiği andan itibaren belirlenen nöbetçi eczaneler hizmet verir.",
      sections: [
        {
          heading: "Nöbetçi Eczane Saatleri Nasıl Belirlenir?",
          body: "Hafta içi ve cumartesi günleri normal eczaneler akşam 19:00'da (bazı illerde 18:00 veya 18:30) mesaisini tamamlar. Bu saatten itibaren o bölgenin nöbetçi eczaneleri görevi devralır ve ertesi gün sabah saat 09:00'a kadar aralıksız hizmet verir.",
          highlights: [
            "Hafta İçi & Cumartesi: Akşam mesai bitiminden ertesi sabah 09:00'a kadar",
            "Pazar Günleri: Sabah 09:00'dan pazartesi sabah 09:00'a kadar 24 saat kesintisiz",
            "Resmi ve Dini Bayramlar: Tam gün 24 saat nöbet sistemi geçerlidir",
          ],
        },
        {
          heading: "Sabah 09:00 Nöbet Devri Neden Önemlidir?",
          body: "Sabah saat tam 09:00'da tüm serbest eczaneler kepenk açar ve normal mesaiye başlar. Dolayısıyla bir önceki gecenin nöbet listesi sabah 09:00 itibarıyla sona erer. Eğer sabah 09:00'dan sonra ilaç alacaksanız, herhangi bir açık eczaneye gidebilirsiniz.",
        },
      ],
      faq: [
        {
          q: "Pazar günü gündüz eczaneler açık mı?",
          a: "Pazar günleri yalnızca o gün için görevlendirilen nöbetçi eczaneler açıktır. Normal eczaneler pazar günü kapalıdır.",
        },
        {
          q: "Nöbet listesi gün içinde değişir mi?",
          a: "Nöbet listeleri İl Sağlık Müdürlükleri ve Eczacı Odaları tarafından aylık olarak belirlenir ve olağanüstü durumlar haricinde gün içinde değişmez.",
        },
      ],
    },
  },
  {
    id: "2",
    slug: "nobetci-eczaneden-erecete-ve-raporlu-ilac-nasil-alinir",
    title: "Gece Acil İlaç Temini: Nöbetçi Eczaneden e-Reçete ve Raporlu İlaç Alma Rehberi",
    excerpt: "Hastanelerin acil servisinden yazılan e-reçeteler nöbetçi eczanelerde nasıl sorgulanır? Kronik raporlu ilaçlar ve katkı payı kuralları.",
    category: "SGK & e-Reçete",
    readTime: "5 dk okuma",
    date: "18 Eylül 2026",
    keywords: ["e-reçete nöbetçi eczane", "raporlu ilaç nöbetçi", "acil servis reçetesi", "SGK ilaç katkı payı"],
    content: {
      intro: "Gece saatlerinde acil servise başvuran hastaların en sık karşılaştığı ihtiyaç, hekimin sisteme girdiği e-reçeteyi nöbetçi eczaneden eksiksiz temin etmektir.",
      sections: [
        {
          heading: "e-Reçete Numarası ve T.C. Kimlik Kartı",
          body: "Acil serviste muayene olduktan sonra doktorunuzun verdiği SMS e-reçete kodunu veya kağıt reçete barkodunu nöbetçi eczacıya iletmeniz yeterlidir. MEDULA SGK sistemi 7/24 nöbetçi eczanelerde aktiftir.",
          highlights: [
            "T.C. Kimlik Kartınızı mutlaka yanınızda bulundurun",
            "Doktorunuzun yazdığı e-reçete kodunu (Örn: 2L4K89) hazır tutun",
            "Kronik hastalık raporlu ilaçlarınızı rapor süresi bitmediyse nöbetçiden alabilirsiniz",
          ],
        },
        {
          heading: "Reçetesiz Satılan Acil Ürünler",
          body: "Ateş düşürücü şuruplar, ağrı kesiciler, yanık kremleri, çocuk mamaları, serum fizyolojikler ve medikal pansuman ürünleri nöbetçi eczanelerden reçetesiz olarak da satın alınabilir.",
        },
      ],
      faq: [
        {
          q: "Nöbetçi eczanede MEDULA sistemi çalışır mı?",
          a: "Evet, SGK MEDULA provizyon sistemi nöbetçi eczaneler için 7/24 kesintisiz hizmet vermektedir.",
        },
      ],
    },
  },
  {
    id: "3",
    slug: "nobetci-eczanelerde-ekstra-ucret-var-mi-fiyat-tarifesi",
    title: "Nöbetçi Eczanelerde Ekstra Ücret Alınır mı? Yasal Haklarınız ve SGK Fiyatları",
    excerpt: "Nöbetçi eczanelerde ilaçlar daha pahalı mı? Gece nöbet farkı veya ekstra servis bedeli alınması yasal mıdır?",
    category: "Mevzuat & Saatler",
    readTime: "3 dk okuma",
    date: "17 Eylül 2026",
    keywords: ["nöbetçi eczane fiyat farkı", "ilaç fiyatları nöbet", "gece nöbet ücreti", "eczane yasal haklar"],
    content: {
      intro: "Halk arasında yaygın bir yanılgı, nöbetçi eczanelerin gece hizmet verdikleri için ilaçları daha yüksek fiyata sattığı yönündedir. Bu bilgi tamamen yanlıştır.",
      sections: [
        {
          heading: "T.C. Sağlık Bakanlığı ve SGK Sabit Fiyat Güvencesi",
          body: "Türkiye'de tüm ilaç fiyatları Sağlık Bakanlığı İlaç ve Tıbbi Cihaz Kurumu (TİTCK) tarafından Resmi Gazete'de yayımlanan İlaç Fiyat Kararnamesi ile belirlenir. Gündüz satılan ilacın fiyatı ile gece nöbette satılan ilacın fiyatı kuruşu kuruşuna aynıdır.",
          highlights: [
            "Hiçbir nöbetçi eczane 'nöbet hizmet bedeli' veya 'gece açma farkı' talep edemez",
            "SGK katkı payı ve muayene ücreti standart gündüz oranlarıyla aynıdır",
            "Fiyat uyuşmazlığı durumunda ALO 184 SABİM hattına şikayette bulunabilirsiniz",
          ],
        },
      ],
    },
  },
  {
    id: "4",
    slug: "istanbul-ankara-izmir-en-yakin-nobetci-eczane-bulma",
    title: "İstanbul, Ankara, İzmir ve 81 İlde En Yakın Nöbetçi Eczaneyi Bulma Taktikleri",
    excerpt: "Metropollerde ve ilçelerde gece nöbetçi eczane ararken zaman kaybetmemek için canlı GPS ve dijital harita kullanımı.",
    category: "Şehir Rehberleri",
    readTime: "4 dk okuma",
    date: "16 Eylül 2026",
    keywords: ["istanbul nöbetçi eczane", "ankara nöbetçi eczane", "izmir nöbetçi eczane", "en yakın eczane navigasyon"],
    content: {
      intro: "Özellikle büyükşehirlerde gece saatlerinde açık nöbetçi eczaneyi bulmak ve trafik yoğunluğuna takılmadan ulaşmak kritik önem taşır.",
      sections: [
        {
          heading: "Canlı GPS ile Otomatik Mesafe Sıralaması",
          body: "Sitemizde yer alan 'Yakınımdaki Eczaneleri Bul (GPS)' özelliği, anlık konumunuzu alarak bulunduğunuz noktaya en yakın açık eczaneleri metre cinsinden sıralar. Doğrudan 'Yol Tarifi' butonuna basarak Google Haritalar navigasyonunu başlatabilirsiniz.",
          highlights: [
            "İstanbul'da 39 ilçede her gece ortalama 140-180 nöbetçi eczane görev yapar",
            "Ankara'da 25 ilçede ortalama 60-80 nöbetçi eczane açıktır",
            "İzmir'de 30 ilçede her gece 50-70 nöbetçi eczane hizmet verir",
          ],
        },
      ],
    },
  },
  {
    id: "5",
    slug: "alo-184-sabim-ve-bulunmayan-ilaclar-icin-cozumler",
    title: "Nöbetçi Eczanede Aradığınız İlaç Yoksa Ne Yapmalısınız? ALO 184 ve Çözüm Yolları",
    excerpt: "Gece nöbette kritik bir ilacı bulamadığınızda uygulayabileceğiniz alternatif yöntemler, eşdeğer ilaç kuralı ve Sağlık Bakanlığı iletişim kanalları.",
    category: "Acil Sağlık",
    readTime: "4 dk okuma",
    date: "15 Eylül 2026",
    keywords: ["ilaç bulamıyorum nöbetçi", "alo 184 sabim", "eşdeğer ilaç", "acil ilaç temini"],
    content: {
      intro: "Nadir bulunan veya piyasada dönemsel olarak tedarik sıkıntısı yaşanan ilaçlar için gece saatlerinde doğru adımları bilmek hayati önem taşır.",
      sections: [
        {
          heading: "1. Eşdeğer (Muadil) İlaç Değerlendirmesi",
          body: "Eczacınız, doktorunuzun yazdığı ilacın aynı etken maddeye, aynı doza ve aynı biyoyararlanıma sahip eşdeğerini size sunabilir. Türkiye'de ruhsatlı tüm eşdeğer ilaçlar orijinal ilaçla aynı tedavi edici güce sahiptir.",
        },
        {
          heading: "2. Civar Nöbetçi Eczanelerle İletişim",
          body: "Nöbetçi eczacılar bölgedeki diğer nöbetçi meslektaşlarıyla anlık iletişim halindedir. Eczacınızdan diğer nöbetçilerin stok durumunu sorgulamasını rica edebilirsiniz.",
        },
        {
          heading: "3. ALO 184 SABİM Hattı",
          body: "Sağlık Bakanlığı İletişim Merkezi (SABİM), kritik ve hayati ilaçların temininde vatandaşlara 7/24 danışmanlık hizmeti sağlamaktadır.",
        },
      ],
    },
  },
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const categories = ["Tümü", "Mevzuat & Saatler", "SGK & e-Reçete", "Acil Sağlık", "Şehir Rehberleri"];

  const filteredArticles = useMemo(() => {
    return ARTICLES_DATA.filter((article) => {
      const matchCat = selectedCategory === "Tümü" || article.category === selectedCategory;
      const matchSearch =
        !searchTerm.trim() ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <main className="min-h-screen bg-gray-50/50 pb-16">
      <PageIntro
        eyebrow="BİLGİ BANKASI & SAĞLIK REHBERİ"
        title="Nöbetçi Eczane ve İlaç Rehberi"
        description="Türkiye'de nöbetçi eczane çalışma saatleri, acil e-reçete temini, ilaç fiyatlandırması ve mevzuat hakkında uzman makaleleri."
      />

      <div className="container max-w-6xl mt-6">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Konu veya anahtar kelime ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Article Reader Modal / Full View */}
        {activeArticle ? (
          <article className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-sm mb-12">
            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              className="button button-quiet text-xs font-bold py-1.5 px-3 mb-6 inline-flex items-center gap-1.5 cursor-pointer"
            >
              ← Tüm Makalelere Dön
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                {activeArticle.category}
              </span>
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                <Calendar size={13} /> {activeArticle.date}
              </span>
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                <Clock size={13} /> {activeArticle.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
              {activeArticle.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed pb-6 border-b border-gray-100 mb-6">
              {activeArticle.content.intro}
            </p>

            <div className="space-y-8 text-gray-800 leading-relaxed">
              {activeArticle.content.sections.map((sec, i) => (
                <section key={i}>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">
                    {sec.heading}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                    {sec.body}
                  </p>
                  {sec.highlights && sec.highlights.length > 0 && (
                    <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 my-3 space-y-2">
                      {sec.highlights.map((hl, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2 text-xs sm:text-sm font-bold text-red-950">
                          <CheckCircle2 size={16} className="text-red-600 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}

              {activeArticle.content.faq && (
                <section className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <HelpCircle size={20} className="text-red-600" /> Sıkça Sorulan Sorular
                  </h3>
                  <div className="space-y-3">
                    {activeArticle.content.faq.map((item, fIdx) => (
                      <div key={fIdx} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <strong className="block text-sm font-black text-gray-900 mb-1">
                          {item.q}
                        </strong>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Keyword tags */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Etiketler:</span>
              {activeArticle.keywords.map((k) => (
                <span key={k} className="text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200">
                  #{k}
                </span>
              ))}
            </div>
          </article>
        ) : (
          /* Grid of Articles */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <article
                key={art.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-xs hover:border-red-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  setActiveArticle(art);
                  window.scrollTo({ top: 200, behavior: "smooth" });
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {art.category}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{art.readTime}</span>
                  </div>

                  <h3 className="text-lg font-black text-gray-900 group-hover:text-red-600 transition-colors leading-snug mb-2">
                    {art.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">{art.date}</span>
                  <span className="text-xs font-black text-red-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Okumaya Başla <ArrowRight size={14} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Quick Link to Main Duty Pharmacies */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-xl sm:text-2xl font-black mb-1">
              Şu anda açık nöbetçi eczaneleri görmek ister misiniz?
            </h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              GPS konumunuzla veya 81 il seçimi yaparak en yakın açık nöbetçi eczaneleri canlı harita üzerinde listeleyebilirsiniz.
            </p>
          </div>
          <Link href="/" className="button bg-white text-red-700 hover:bg-red-50 font-black text-sm px-6 py-3 rounded-xl shrink-0 whitespace-nowrap shadow-sm">
            Nöbetçi Eczaneleri Bul <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
