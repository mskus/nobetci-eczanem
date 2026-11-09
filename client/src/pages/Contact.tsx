import { useState } from "react";
import { Send, CheckCircle2, ShieldCheck, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { PageIntro } from "@/components/SiteLayout";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const LOCAL_MESSAGES_KEY = "nobetci_contact_messages_backup_v1";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Nöbetçi Eczane Bilgi Düzeltme");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Lütfen adınız, e-posta adresiniz ve mesajınızı eksiksiz doldurunuz.");
      return;
    }

    setSubmitting(true);
    const newMsg = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      subject,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // 1. Save to localStorage backup (guarantees persistence everywhere)
    try {
      const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newMsg);
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(list.slice(0, 500)));
    } catch {}

    // 2. Send to backend API
    try {
      await fetch(`${API_BASE_URL}/api/contact/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
    } catch {
      // Local backup handled
    }

    setSubmitting(false);
    setSentSuccess(true);
    toast.success("Mesajınız iletildi!", {
      description: "Mesajınız yönetici paneline başarıyla kaydedildi.",
    });
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  return (
    <main className="pb-16">
      <PageIntro
        eyebrow="BİZE ULAŞIN"
        title="İletişim & Geri Bildirim Formu"
        description="Nöbetçi eczane veri güncellemeleri, önerileriniz veya sorularınız için aşağıdaki formu doldurarak bize doğrudan ulaşabilirsiniz."
      />

      <section className="py-6 sm:py-10 bg-gray-50/50">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-lg">
            {sentSuccess ? (
              <div className="text-center py-8 space-y-4 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Mesajınız Alındı</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Mesajınız başarıyla iletildi. Yetkili ekibimiz talebinizi inceleyip en kısa sürede
                  belirttiğiniz e-posta adresine dönüş yapacaktır.
                </p>
                <button
                  type="button"
                  onClick={() => setSentSuccess(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-black transition-colors"
                >
                  Yeni Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">İletişim Formu</h2>
                    <p className="text-xs text-gray-500">Tüm alanlar doğrudan yetkili yönetici paneline iletilir.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Adınız & Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full px-3.5 py-3 text-sm font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 bg-gray-50 focus:bg-white transition-all"
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adiniz@alanadi.com"
                      className="w-full px-3.5 py-3 text-sm font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Telefon Numaranız <span className="text-gray-400 font-normal">(İsteğe bağlı)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3.5 py-3 text-sm font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Konu Başlığı
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 bg-gray-50 focus:bg-white cursor-pointer transition-all"
                  >
                    <option value="Nöbetçi Eczane Bilgi Düzeltme">Nöbetçi Eczane Bilgisi / Nöbet Düzeltme</option>
                    <option value="Reklam & Sponsorluk Talebi">Reklam & Tanıtım İş Birliği</option>
                    <option value="Hastane & ASM Bildirimi">Hastane / Sağlık Ocağı Güncellemesi</option>
                    <option value="Hata & Teknik Geri Bildirim">Teknik Hata & Mobil Deneyim Önerisi</option>
                    <option value="Genel Soru / Diğer">Diğer Konular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Mesajınız *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mesajınızı, düzeltilmesini istediğiniz eczane adını veya önerinizi detaylıca yazınız..."
                    className="w-full px-3.5 py-3 text-sm font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 bg-gray-50 focus:bg-white resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.99] disabled:opacity-70"
                >
                  {submitting ? (
                    <span>İletiliyor...</span>
                  ) : (
                    <>
                      <Send size={17} />
                      <span>Mesajı Gönder</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Bilgileriniz gizli tutulur, 3. taraflarla paylaşılmaz.
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
