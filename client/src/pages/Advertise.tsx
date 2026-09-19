import { useState } from "react";
import {
  ArrowRight,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Send,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { PageIntro } from "@/components/SiteLayout";

export default function Advertise() {
  const [activeTab, setActiveTab] = useState<"reklam" | "iletisim">("reklam");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSubject, setFormSubject] = useState("Genel İletişim / Reklam");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formats = [
    {
      icon: Monitor,
      size: "200 × 600",
      title: "Masaüstü Yan Uygulama & Banner",
      copy: "Harita ve sonuçların yanında, kullanıcı deneyimini bozmadan markanızı ve uygulamanızı tanıtan yüksek etkileşimli alan.",
      label: "Masaüstü",
      color: "border-red-200 bg-red-50/50",
    },
    {
      icon: Tablet,
      size: "728 × 90",
      title: "Sayfa İçi & Liste Arası Banner",
      copy: "Nöbetçi eczane listesi içinde her 4 kartta bir doğal akışta görüntülenen, tıklama oranı yüksek yatay alan.",
      label: "Yatay Banner",
      color: "border-blue-200 bg-blue-50/50",
    },
    {
      icon: Smartphone,
      size: "320 × 100",
      title: "Mobil Uygulama İçi Alanı",
      copy: "Akıllı telefon kullanıcılarına hitap eden, hafif, hızlı ve yüksek dönüşümlü mobil yerleşim.",
      label: "Mobil",
      color: "border-emerald-200 bg-emerald-50/50",
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      toast.error("Lütfen adınız, e-posta adresiniz ve mesajınızı doldurun.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Mesajınız başarıyla iletildi!", {
        description: "Yetkili ekibimiz en geç 24 saat içinde tarafınıza dönüş yapacaktır.",
      });
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormMessage("");
    }, 800);
  };

  return (
    <main className="pb-16">
      <PageIntro
        eyebrow="İŞ BİRLİĞİ & İLETİŞİM"
        title="Reklam, Sponsorluk ve İletişim"
        description="Nöbetçi Eczanem, Türkiye genelinde her gün ihtiyaç anında eczane arayan yüz binlerce kullanıcıya güvenilir, temiz ve kurumsal tanıtım imkanları sunar."
      />

      <section className="py-8 bg-gray-50/50">
        <div className="container max-w-5xl mx-auto px-4">
          
          {/* Sekme Değiştirici */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <button
              type="button"
              onClick={() => setActiveTab("reklam")}
              className={`px-6 py-3 rounded-xl font-black text-sm transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "reklam"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Sparkles size={16} />
              <span>Reklam & Tanıtım Seçenekleri</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("iletisim")}
              className={`px-6 py-3 rounded-xl font-black text-sm transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "iletisim"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <MessageSquare size={16} />
              <span>Bize Ulaşın / İletişim Formu</span>
            </button>
          </div>

          {/* 1. REKLAM SEKMESİ */}
          {activeTab === "reklam" && (
            <div className="space-y-10 animate-fadeIn">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Kullanıcı Dostu ve Saygın Reklam Alanları
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Reklam alanlarımız sağlık arayan kullanıcıların ekranını kilitlemez veya rahatsız etmez. Markanızın itibarını koruyan modern tasarımlar hazırlıyoruz.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {formats.map((fmt, idx) => {
                  const Icon = fmt.icon;
                  return (
                    <article
                      key={idx}
                      className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-xs hover:border-gray-300 hover:shadow-md transition-all"
                    >
                      <div>
                        <div className={`p-4 rounded-xl border ${fmt.color} mb-4 text-center`}>
                          <span className="text-[10px] font-black uppercase text-gray-500 bg-white/80 px-2 py-0.5 rounded">
                            {fmt.label}
                          </span>
                          <p className="font-mono font-black text-base text-gray-800 mt-2">
                            {fmt.size}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={20} className="text-red-600" />
                          <h3 className="font-black text-gray-900 text-base">
                            {fmt.title}
                          </h3>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed mb-4">
                          {fmt.copy}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-700">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <Check size={15} /> Özel Tasarım Desteği
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <Check size={15} /> İl / İlçe Bazlı Hedefleme
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Reklam Hızlı Başvuru Kartı */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                <div className="space-y-1">
                  <h3 className="text-xl font-black">Markanız İçin Özel Yayın Planı Oluşturalım</h3>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                    Sektörünüze ve hedef kitlenize uygun haftalık veya aylık sponsorluk seçeneklerini öğrenmek için hemen bizimle iletişime geçin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("iletisim")}
                  className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl text-sm shrink-0 flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <span>Teklif Alın</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* 2. İLETİŞİM SEKMESİ */}
          {activeTab === "iletisim" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              {/* Sol: İletişim Bilgileri */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    Doğrudan İletişim
                  </h3>
                  <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                    Nöbetçi eczane verileri, reklam teklifleri veya teknik geri bildirimleriniz için bize dilediğiniz kanaldan ulaşabilirsiniz.
                  </p>

                  <div className="space-y-4 text-xs sm:text-sm">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail size={18} className="text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-400 block">
                          E-Posta
                        </span>
                        <a href="mailto:info@nobetcieczanem.com" className="font-bold text-gray-900 hover:text-red-600">
                          info@nobetcieczanem.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Phone size={18} className="text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-400 block">
                          Telefon & WhatsApp Destek
                        </span>
                        <a href="tel:+908503020000" className="font-bold text-gray-900 hover:text-red-600">
                          0850 302 00 00
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <MapPin size={18} className="text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-400 block">
                          Genel Merkez
                        </span>
                        <p className="font-semibold text-gray-800">
                          Levent Mah. Büyükdere Cad. No:175, Şişli / İstanbul
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-emerald-800">
                    <ShieldCheck size={16} /> 24 Saat İçinde Geri Dönüş Garantisi
                  </div>
                  <p className="text-emerald-700">
                    Tüm reklam ve veri düzeltme talepleri teknik ekibimizce aynı gün içinde incelenir ve yanıtlanır.
                  </p>
                </div>
              </div>

              {/* Sağ: İletişim Formu */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                  <h3 className="text-xl font-black text-gray-900 mb-1">
                    Bize Mesaj Gönderin
                  </h3>
                  <p className="text-xs text-gray-500 mb-6">
                    Aşağıdaki formu doldurarak talebinizi iletebilirsiniz.
                  </p>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                        Adınız & Soyadınız *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                          E-Posta Adresiniz *
                        </label>
                        <input
                          type="email"
                          required
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="ornek@alanadi.com"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                          Telefon Numaranız
                        </label>
                        <input
                          type="tel"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="05XX XXX XX XX"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                        Konu / Kategori
                      </label>
                      <select
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50"
                      >
                        <option value="Genel İletişim / Reklam">Reklam & Sponsorluk Teklifi</option>
                        <option value="Eczane Veri Güncelleme">Eczane Bilgisi / Nöbet Düzeltme</option>
                        <option value="Teknik Geri Bildirim">Hata Bildirimi & Teknik Destek</option>
                        <option value="Diğer">Diğer Konular</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                        Mesajınız *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder="Talebinizi, hedef bölgenizi veya sorunuzu detaylıca belirtiniz..."
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50 focus:bg-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                    >
                      {submitting ? (
                        <span>Gönderiliyor...</span>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Mesajı Gönder</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
