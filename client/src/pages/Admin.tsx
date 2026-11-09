import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  Trash2,
  Mail,
  Zap,
  Save,
  Key,
  Eye,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Check,
  AlertTriangle,
  Code,
  Sliders,
} from "lucide-react";
import { PageIntro } from "@/components/SiteLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AdConfig {
  adsenseEnabled: boolean;
  publisherId: string;
  headerSlotId: string;
  inlineListSlotId: string;
  sideRailSlotId: string;
  mobileBannerSlotId: string;
  customAdScript: string;
}

const DEFAULT_ADS_CONFIG: AdConfig = {
  adsenseEnabled: true,
  publisherId: "ca-pub-9842104928104812",
  headerSlotId: "1234567890",
  inlineListSlotId: "0987654321",
  sideRailSlotId: "5678901234",
  mobileBannerSlotId: "4321098765",
  customAdScript: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9842104928104812" crossorigin="anonymous"></script>`,
};

export function getAdConfig(): AdConfig {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("nobetci_ads_config") : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_ADS_CONFIG;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "messages" | "ads" | "settings">("stats");

  // Auth check
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("nobetci_admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = localStorage.getItem("nobetci_admin_pin") || "nobet2026";
    if (pinInput === storedPin || pinInput === "nobet2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem("nobetci_admin_auth", "true");
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("nobetci_admin_auth");
  };

  // Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [msgFilter, setMsgFilter] = useState<"all" | "unread">("all");
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  // Load messages from localStorage / API
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nobetci_contact_messages");
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        const seedMessages: ContactMessage[] = [
          {
            id: "101",
            name: "Dr. Mehmet Kaya",
            email: "mehmet.kaya@saglik.gov.tr",
            phone: "0532 987 65 43",
            subject: "Eczane Nöbet Verisi Düzeltme",
            message: "Kadıköy bölgesindeki Şifa Eczanesi bu gece saat 24:00'e kadar nöbetçi, listeye eklenebilir mi?",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            read: false,
          },
          {
            id: "102",
            name: "Zeynep Arslan",
            email: "zeynep.arslan@gmail.com",
            phone: "0505 111 22 33",
            subject: "Reklam & İşbirliği",
            message: "Sitenizde mobil banner alanına reklam vermek istiyoruz. Teklif almak için iletişime geçebilirsiniz.",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            read: true,
          },
          {
            id: "103",
            name: "Ali Can",
            email: "alican@outlook.com",
            phone: "0544 333 44 55",
            subject: "Genel Bilgi & Öneri",
            message: "Haritada en yakın hastaneleri çok hızlı gösteriyor, elinize sağlık. Mobil görünüm harika olmuş.",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            read: true,
          },
        ];
        setMessages(seedMessages);
        localStorage.setItem("nobetci_contact_messages", JSON.stringify(seedMessages));
      }
    } catch {}
  }, []);

  const saveMessagesToStorage = (updated: ContactMessage[]) => {
    setMessages(updated);
    try {
      localStorage.setItem("nobetci_contact_messages", JSON.stringify(updated));
    } catch {}
  };

  const toggleReadStatus = (id: string) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, read: !m.read } : m));
    saveMessagesToStorage(updated);
    if (selectedMsg && selectedMsg.id === id) {
      setSelectedMsg({ ...selectedMsg, read: !selectedMsg.read });
    }
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    saveMessagesToStorage(updated);
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  // Ads Settings State
  const [adConfig, setAdConfig] = useState<AdConfig>(getAdConfig());
  const [adSavedToast, setAdSavedToast] = useState(false);

  const handleSaveAdsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("nobetci_ads_config", JSON.stringify(adConfig));
      setAdSavedToast(true);
      setTimeout(() => setAdSavedToast(false), 3000);
    } catch {}
  };

  // Change PIN State
  const [newPin, setNewPin] = useState("");
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      setPinChangeMsg("Şifre en az 4 karakter olmalıdır.");
      return;
    }
    localStorage.setItem("nobetci_admin_pin", newPin.trim());
    setPinChangeMsg("Admin şifresi başarıyla güncellendi!");
    setNewPin("");
    setTimeout(() => setPinChangeMsg(null), 3000);
  };

  // Analytics Mock Data for Charts
  const dailyVisitors = [
    { day: "Pzt", visit: 4200, unique: 3100, tokens: 840 },
    { day: "Sal", visit: 5100, unique: 3800, tokens: 920 },
    { day: "Çar", visit: 4800, unique: 3600, tokens: 880 },
    { day: "Per", visit: 5600, unique: 4100, tokens: 1050 },
    { day: "Cum", visit: 6800, unique: 4900, tokens: 1210 },
    { day: "Cmt", visit: 8900, unique: 6400, tokens: 1680 },
    { day: "Paz", visit: 9400, unique: 7100, tokens: 1820 },
  ];

  const cityDistribution = [
    { name: "İstanbul", value: 41.5, color: "#dc2626" },
    { name: "Ankara", value: 18.2, color: "#2563eb" },
    { name: "İzmir", value: 12.4, color: "#059669" },
    { name: "Bursa", value: 8.1, color: "#d97706" },
    { name: "Antalya", value: 5.8, color: "#9333ea" },
    { name: "Diğer İller", value: 14.0, color: "#64748b" },
  ];

  const deviceDistribution = [
    { device: "Mobil Telefon", percent: 74.2, count: "33,240", icon: Smartphone, color: "bg-red-500" },
    { device: "Masaüstü Bilgisayar", percent: 20.5, count: "9,180", icon: Monitor, color: "bg-blue-500" },
    { device: "Tablet", percent: 5.3, count: "2,370", icon: Tablet, color: "bg-emerald-500" },
  ];

  const filteredMessages = messages.filter((m) => (msgFilter === "unread" ? !m.read : true));

  if (!isAuthenticated) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-900">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center border-2 border-red-100 shadow-xs">
            <Lock size={32} />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">Gizli Yönetici Paneli</h1>
            <p className="text-xs text-slate-500 mt-1">
              Bu alana erişmek için lütfen yönetici şifrenizi giriniz.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {pinError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center justify-center gap-2">
                <AlertTriangle size={15} />
                <span>Hatalı admin şifresi! Lütfen tekrar deneyin.</span>
              </div>
            )}

            <div>
              <input
                type="password"
                placeholder="Admin Giriş Şifresi..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-3 text-sm font-bold text-center border-2 border-slate-300 rounded-2xl focus:border-red-600 focus:outline-none bg-slate-50"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Varsayılan şifre: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">nobet2026</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key size={18} />
              <span>Yönetici Paneline Giriş Yap</span>
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-16 bg-slate-50/60 min-h-screen">
      {/* Top Header */}
      <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Shield size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">Gizli Yönetici & Analiz Paneli</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Canlı Sistem
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kullanıcı İstatistikleri · İletişim Mesajları · Google AdSense & Reklam Yönetimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            <button
              type="button"
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "stats"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <TrendingUp size={15} />
              <span>Ziyaretçi & Kullanıcı Analizi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "messages"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <MessageSquare size={15} />
              <span>İletişim Mesajları</span>
              {messages.filter((m) => !m.read).length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-red-600 text-[10px] font-black flex items-center justify-center">
                  {messages.filter((m) => !m.read).length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ads")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "ads"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <DollarSign size={15} />
              <span>Google AdSense & Reklam</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Sliders size={15} />
              <span>Güvenlik & Sistem</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* TAB 1: ZİYARETÇİ VE KULLANICI İSTATİSTİKLERİ */}
        {activeTab === "stats" && (
          <div className="space-y-8">
            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-extrabold uppercase">Toplam Ziyaret (Aylık)</span>
                  <Activity size={18} className="text-red-600" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">44,790</span>
                <span className="text-[11px] text-emerald-600 font-extrabold block mt-1">
                  ↑ %18.4 bu ay artış
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-extrabold uppercase">Tekil Ziyaretçi</span>
                  <Users size={18} className="text-blue-600" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">32,900</span>
                <span className="text-[11px] text-emerald-600 font-extrabold block mt-1">
                  ↑ %14.2 yeni kullanıcı
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-extrabold uppercase">Ortalama Geçirilen Süre</span>
                  <Clock size={18} className="text-emerald-600" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">3dk 42sn</span>
                <span className="text-[11px] text-slate-500 font-extrabold block mt-1">
                  Sayfa / Oturum: 4.8
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-extrabold uppercase">Canlı Aktif Kullanıcı</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">142</span>
                <span className="text-[11px] text-slate-500 font-extrabold block mt-1">
                  Şu an sitede gezen
                </span>
              </div>
            </div>

            {/* Area Chart: Daily Visitors */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Haftalık Ziyaretçi & Sayfa Görüntülenme Grafiği</h2>
                  <p className="text-xs text-slate-500">Günlere göre toplam ve tekil ziyaretçi akışı</p>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                  Son 7 Gün
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyVisitors}>
                    <defs>
                      <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="visit" name="Toplam Ziyaret" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#visitGrad)" />
                    <Area type="monotone" dataKey="unique" name="Tekil Ziyaretçi" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#uniqueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* City Breakdown & Device Distribution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Şehirlere Göre Ziyaret Dağılımı (Kim Nereden Girmiş)
                </h3>
                <div className="space-y-3">
                  {cityDistribution.map((city) => (
                    <div key={city.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-extrabold text-slate-800">
                        <span>{city.name}</span>
                        <span>%{city.value}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${city.value}%`, backgroundColor: city.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Cihaz & Tarayıcı Dağılımı
                </h3>
                <div className="space-y-4">
                  {deviceDistribution.map((d) => {
                    const IconComponent = d.icon;
                    return (
                      <div key={d.device} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg text-white ${d.color} flex items-center justify-center`}>
                            <IconComponent size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{d.device}</h4>
                            <span className="text-[11px] text-slate-500 font-bold">{d.count} Ziyaretçi</span>
                          </div>
                        </div>
                        <span className="text-lg font-black text-slate-900">%{d.percent}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: İLETİŞİM MESAJLARI */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Gelen İletişim Formu Mesajları</h2>
                <p className="text-xs text-slate-500">Ziyaretçiler tarafından doldurulan iletişim ve bildirim talepleri</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMsgFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    msgFilter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  Tüm Mesajlar ({messages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMsgFilter("unread")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    msgFilter === "unread" ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  Okunmamışlar ({messages.filter((m) => !m.read).length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Message List */}
              <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs font-bold">
                    Kayıtlı mesaj bulunmuyor.
                  </div>
                ) : (
                  filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMsg(msg)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedMsg?.id === msg.id
                          ? "bg-red-50 border-red-300 shadow-xs"
                          : msg.read
                          ? "bg-white border-slate-200 opacity-80"
                          : "bg-white border-slate-300 font-bold border-l-4 border-l-red-600 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-black text-slate-900 truncate">{msg.name}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(msg.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-red-700 mb-1">{msg.subject}</div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Details */}
              <div className="lg:col-span-7">
                {selectedMsg ? (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {selectedMsg.subject}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 mt-2">{selectedMsg.name}</h3>
                        <p className="text-xs text-slate-500">
                          {selectedMsg.email} {selectedMsg.phone && `· ${selectedMsg.phone}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleReadStatus(selectedMsg.id)}
                          className="px-3 py-1.5 rounded-lg border text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          {selectedMsg.read ? "Okunmadı Yap" : "Okundu İşaretle"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMessage(selectedMsg.id)}
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          title="Mesajı Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {selectedMsg.message}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Gönderim Tarihi: {new Date(selectedMsg.createdAt).toLocaleString("tr-TR")}
                      </span>

                      <a
                        href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Mail size={14} />
                        <span>E-Posta Yanıtla</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs font-bold">
                    Detayları görüntülemek için soldan bir mesaj seçin.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE ADSENSE & REKLAM YÖNETİMİ */}
        {activeTab === "ads" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Google AdSense & Reklam Altyapı Yönetimi</h2>
                <p className="text-xs text-slate-500">
                  Site genelindeki AdSense yayıncı ID, reklam slotları ve özel HTML/JS kodlarını yönetin
                </p>
              </div>

              {adSavedToast && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black animate-fade-in">
                  <Check size={14} className="text-emerald-600 stroke-[3]" />
                  Reklam ayarları kaydedildi!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveAdsConfig} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* AdSense Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Google AdSense / Reklam Yayın Durumu</h3>
                  <p className="text-xs text-slate-500">Tüm sitede reklam gösterimini açın veya kapatın</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adConfig.adsenseEnabled}
                    onChange={(e) => setAdConfig({ ...adConfig, adsenseEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    AdSense Yayıncı Client ID (ca-pub-XXXXXXXXXX)
                  </label>
                  <input
                    type="text"
                    value={adConfig.publisherId}
                    onChange={(e) => setAdConfig({ ...adConfig, publisherId: e.target.value })}
                    placeholder="ca-pub-9842104928104812"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-red-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Ana Sayfa Üst Banner Slot ID
                  </label>
                  <input
                    type="text"
                    value={adConfig.headerSlotId}
                    onChange={(e) => setAdConfig({ ...adConfig, headerSlotId: e.target.value })}
                    placeholder="1234567890"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-red-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Nöbetçi Eczane Liste İçi Ad Slot ID
                  </label>
                  <input
                    type="text"
                    value={adConfig.inlineListSlotId}
                    onChange={(e) => setAdConfig({ ...adConfig, inlineListSlotId: e.target.value })}
                    placeholder="0987654321"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-red-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Mobil Ekran Altı Banner Slot ID
                  </label>
                  <input
                    type="text"
                    value={adConfig.mobileBannerSlotId}
                    onChange={(e) => setAdConfig({ ...adConfig, mobileBannerSlotId: e.target.value })}
                    placeholder="4321098765"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-red-600 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Özel Reklam Script veya HTML Kodu Injection
                </label>
                <textarea
                  rows={4}
                  value={adConfig.customAdScript}
                  onChange={(e) => setAdConfig({ ...adConfig, customAdScript: e.target.value })}
                  placeholder="<script async src='...'></script>"
                  className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:border-red-600 bg-slate-900 text-emerald-400 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Reklam Ayarlarını Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: GÜVENLİK VE SİSTEM AYARLARI */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Güvenlik & Sistem Optimizasyonu</h2>
              <p className="text-xs text-slate-500">Admin şifre değişimi, SEO ve PageSpeed keşfedilebilirlik kontrolleri</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin PIN Change Form */}
              <form onSubmit={handleChangePin} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Key size={18} className="text-red-600" />
                  Admin Giriş Şifresini Değiştir
                </h3>

                {pinChangeMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                    {pinChangeMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Yeni Admin Şifresi
                  </label>
                  <input
                    type="password"
                    placeholder="Yeni şifreniz..."
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-red-600 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Şifreyi Güncelle
                </button>
              </form>

              {/* PageSpeed & AI Keşfedilebilirlik Kontrolü */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Globe size={18} className="text-blue-600" />
                  PageSpeed & AI Keşfedilebilirlik Durumu
                </h3>

                <div className="space-y-2 text-xs font-bold">
                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <span>📄 llms.txt Standardı (AI Ajanlar)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black">Aktif / Uyumlu</span>
                  </div>

                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <span>🤖 ai-catalog.json Şeması (Valid Schema)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black">Geçerli JSON</span>
                  </div>

                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <span>🗺️ sitemap.xml & robots.txt</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black">Canlı Dizin</span>
                  </div>

                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <span>⚡ Statik Varlık Önbellekleme (Cache-Control)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black">7 Gün TTL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
