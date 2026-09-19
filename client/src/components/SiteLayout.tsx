import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  Plus,
  X,
  Smartphone,
  Download,
  Sparkles,
  Star,
  ShieldCheck,
  HeartPulse,
  Activity,
  Globe2,
  Pill,
  Building2,
  Phone,
  Radio,
  Syringe,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { QuotaBadge } from "./QuotaBadge";
import { useQuota } from "@/hooks/useQuota";
import { startLocationUpdates } from "@/lib/globalLocation";

type SiteLayoutProps = {
  children: React.ReactNode;
};

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Nöbetçi Eczanem ana sayfa">
      <span className="brand-mark" aria-hidden="true"><Plus strokeWidth={3.2} /></span>
      <span className="brand-copy">
        <strong>Nöbetçi</strong>
        <span>Eczanem</span>
      </span>
    </Link>
  );
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { quota } = useQuota();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => { startLocationUpdates(); }, []);

  return (
    <div className="site-shell">
      <header className="site-header relative z-40">
        <div className="header-inner">
          <Brand />
          
          <nav className="desktop-nav flex items-center gap-1.5" aria-label="Ana navigasyon">
            {/* 1. Nöbetçi Eczaneler — Canlı Yeşil Efektli */}
            <Link
              href="/"
              className={`relative px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                location === "/"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-gray-800 hover:bg-gray-100 hover:text-gray-950"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>Nöbetçi Eczaneler</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-300">
                CANLI
              </span>
            </Link>

            {/* 2. En Yakın Hastane — Acil Kırmızı Efektli */}
            <Link
              href="/en-yakin-hastane"
              className={`relative px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                location === "/en-yakin-hastane"
                  ? "bg-red-700 text-white shadow-xs"
                  : "text-red-700 bg-red-50/90 border border-red-200 hover:bg-red-100"
              }`}
            >
              <HeartPulse size={15} className="text-red-600 animate-pulse shrink-0" />
              <span>En Yakın Hastane</span>
              <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded shadow-2xs">
                KONUM
              </span>
            </Link>

            {/* 3. Sağlık Portalı & Araçlar — SGK, Polen, TİTCK, Etkileşim */}
            <Link
              href="/saglik-araclari"
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                location.startsWith("/saglik-araclari") ||
                location.startsWith("/sgk-katki-payi") ||
                location.startsWith("/hava-kalitesi") ||
                location.startsWith("/titck") ||
                location.startsWith("/ilac-etkilesim") ||
                location.startsWith("/kan-bagisi") ||
                location.startsWith("/ilk-yardim")
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-emerald-900 bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <Activity size={15} className="text-emerald-600 shrink-0" />
              <span>Sağlık Portalı</span>
              <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                YENİ
              </span>
            </Link>

            {/* 4. Türkiye'de Sağlık (WHO) */}
            <Link
              href="/turkiyede-saglik"
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                location === "/turkiyede-saglik"
                  ? "bg-cyan-800 text-white shadow-xs"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <Globe2 size={15} className="text-cyan-700 shrink-0" />
              <span>Türkiye'de Sağlık</span>
            </Link>

            {/* 5. Tüm Eczaneler */}
            <Link
              href="/tum-eczaneler"
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                location === "/tum-eczaneler"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <Building2 size={15} className="text-gray-600 shrink-0" />
              <span>Tüm Eczaneler</span>
            </Link>

            {/* 6. İlaç & Sağlık Rehberi */}
            <Link
              href="/blog"
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                location === "/blog"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <Pill size={15} className="text-amber-600 shrink-0" />
              <span>İlaç & Sağlık Rehberi</span>
            </Link>

            {/* 7. Reklam & İletişim */}
            <Link
              href="/reklam-ver"
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                location === "/reklam-ver" || location === "/iletisim"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>İletişim</span>
            </Link>
          </nav>

          <div className="header-actions flex items-center gap-2">
            <button
              type="button"
              className="mobile-menu-button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobil Menü Top Drawer */}
        {mobileOpen && (
          <nav id="mobile-navigation" className="mobile-nav p-4 space-y-2.5 bg-white border-b border-gray-200 max-h-[80vh] overflow-y-auto" aria-label="Mobil navigasyon">
            <Link href="/" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center justify-between font-black text-red-600">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Nöbetçi Eczaneler
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">CANLI</span>
            </Link>
            <Link href="/en-yakin-hastane" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center justify-between font-black text-red-700">
              <span className="flex items-center gap-2">
                <HeartPulse size={16} />
                En Yakın Hastane & ASM
              </span>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-extrabold">KONUM</span>
            </Link>
            <Link href="/saglik-araclari" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center justify-between font-black text-emerald-700">
              <span className="flex items-center gap-2">
                <Activity size={16} />
                Sağlık Portalı & SGK Araçları
              </span>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold">YENİ</span>
            </Link>
            <Link href="/kan-bagisi" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <Syringe size={16} className="text-blue-600" />
              Kan Bağışı & İlk Yardım Merkezleri
            </Link>
            <Link href="/titck-ilac-geri-cekme" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <ShieldAlert size={16} className="text-amber-600" />
              TİTCK İlaç Geri Çekme & Uyarılar
            </Link>
            <Link href="/sgk-katki-payi-hesaplayici" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <Pill size={16} className="text-emerald-700" /> SGK Katkı Payı Hesaplayıcı
            </Link>
            <Link href="/hava-kalitesi-polen" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <Activity size={16} className="text-cyan-700" /> Hava Kalitesi ve Polen
            </Link>
            <Link href="/ilk-yardim" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <HeartPulse size={16} className="text-red-700" /> İlk Yardım Rehberi
            </Link>
            <Link href="/turkiyede-saglik" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <Globe2 size={16} className="text-cyan-700" />
              Türkiye'de Sağlık İstatistikleri
            </Link>
            <Link href="/tum-eczaneler" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <Building2 size={16} className="text-gray-600" />
              Tüm Eczaneler & Hızlı Arama
            </Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <Pill size={16} className="text-amber-600" />
              İlaç Fiyatları & Sağlık Rehberi
            </Link>
            <Link href="/veri-kaynaklari" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <FileText size={16} className="text-indigo-600" />
              Resmi Veri Kaynakları (TİTCK & AFAD)
            </Link>
            <Link href="/reklam-ver" onClick={() => setMobileOpen(false)} className="mobile-nav-link flex items-center gap-2 font-bold text-gray-800">
              <Phone size={16} className="text-gray-600" />
              Reklam & İletişim
            </Link>
          </nav>
        )}
      </header>

      <div className="pb-20 md:pb-0">
        {children}
      </div>

      {/* Modern Mobil Alt Kayan Navigasyon Barı (Mobile Bottom Floating Navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-2xl" aria-label="Mobil alt navigasyon">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            location === "/" ? "text-red-600 font-black" : "text-slate-500 font-bold hover:text-slate-900"
          }`}
        >
          <div className="relative">
            <Plus className="w-5 h-5 stroke-[2.8]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[10px] tracking-tight">Eczaneler</span>
        </Link>

        <Link
          href="/en-yakin-hastane"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            location === "/en-yakin-hastane" ? "text-red-600 font-black" : "text-slate-500 font-bold hover:text-slate-900"
          }`}
        >
          <HeartPulse className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Hastaneler</span>
        </Link>

        <Link
          href="/saglik-araclari"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            location.startsWith("/saglik-araclari") ? "text-emerald-700 font-black" : "text-slate-500 font-bold hover:text-slate-900"
          }`}
        >
          <Activity className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] tracking-tight">Portali</span>
        </Link>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-500 font-bold hover:text-slate-900 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Menü</span>
        </button>
      </nav>

      <footer className="site-footer bg-gray-950 text-white pt-12 pb-8 border-t border-gray-800">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800">
            <div className="md:col-span-2 space-y-3">
              <Brand />
              <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed">
                Nöbetçi Eczanem, ulaşılabildiğinde nöbetçi eczane kayıtlarını ve harita kaynaklı hastane konumlarını gösterir. Bilgileri gitmeden önce telefonla teyit edin.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Sağlık Portalı & Servisler</h4>
              <div className="flex flex-col space-y-2 text-xs font-semibold text-gray-300">
                <Link href="/" className="hover:text-red-400">Nöbetçi Eczaneler (Canlı)</Link>
                <Link href="/en-yakin-hastane" className="hover:text-red-400">En Yakın Hastane & ASM</Link>
                <Link href="/saglik-araclari" className="hover:text-emerald-400">SGK Katkı Payı Hesaplayıcı</Link>
                <Link href="/saglik-araclari" className="hover:text-cyan-400">Polen & Hava Kalitesi İndeksi</Link>
                <Link href="/saglik-araclari" className="hover:text-amber-400">TİTCK İlaç Geri Çekme Bülteni</Link>
                <Link href="/saglik-araclari" className="hover:text-red-400">Kızılay Kan Bağış Noktaları</Link>
                <Link href="/turkiyede-saglik" className="hover:text-cyan-400">Türkiye'de Sağlık (WHO)</Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Kurumsal & Altyapı</h4>
              <div className="flex flex-col space-y-2 text-xs font-semibold text-gray-300">
                <Link href="/reklam-ver" className="hover:text-white">Reklam & Tanıtım</Link>
                <Link href="/iletisim" className="hover:text-white">Bize Ulaşın / Destek</Link>
                <Link href="/veri-kaynaklari" className="text-gray-400 hover:text-white">Veri Kaynakları & API</Link>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <span>© 2026 Nöbetçi Eczanem · Sağlık Bakanlığı ve TEB Esaslarına Uygun Bilgilendirme</span>
            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/veri-kaynaklari" className="hover:text-gray-300 underline">Veri Kaynakları & Tüketim</Link>
              <Link href="/iletisim" className="hover:text-gray-300 underline">İletişim & Geri Bildirim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AdRail({ side }: { side: "left" | "right" }) {
  return (
    <aside
      className={`hidden 2xl:flex flex-col justify-between fixed top-24 ${
        side === "left" ? "left-4" : "right-4"
      } w-52 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white p-4 rounded-2xl border border-gray-700 shadow-2xl z-20`}
      aria-label={`${side === "left" ? "Sol" : "Sağ"} mobil uygulama tanıtım alanı`}
      style={{ minHeight: "560px" }}
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
            MOBİL UYGULAMA
          </span>
          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-0.5">
            <Star size={11} className="text-yellow-400 fill-yellow-400" /> 4.9
          </span>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black shadow-lg mx-auto mb-3">
          <Smartphone size={24} />
        </div>

        <h3 className="text-center font-black text-base leading-tight text-white mb-1">
          Nöbetçi Eczanem
        </h3>
        <p className="text-center text-[11px] text-gray-300 font-semibold mb-3">
          iOS & Android Cebinizde!
        </p>

        <div className="p-2.5 bg-gray-800/90 rounded-xl border border-gray-700 space-y-1.5 text-[11px] text-gray-200 mb-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck size={13} className="shrink-0" /> Canlı GPS Rota Tarifi
          </div>
          <div className="flex items-center gap-1.5 text-red-300 font-bold">
            <Sparkles size={13} className="shrink-0" /> 7/24 Acil Nöbet Bildirimi
          </div>
          <div className="flex items-center gap-1.5 text-blue-300 font-bold">
            <Plus size={13} className="shrink-0" /> Hastane & ASM Rehberi
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-800 text-center">
        <Link
          href="/reklam-ver"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all block"
        >
          <Download size={14} />
          <span>ÜCRETSİZ İNDİR</span>
        </Link>
        <span className="text-[10px] text-gray-400 block">
          App Store & Google Play
        </span>
      </div>
    </aside>
  );
}

export function MobileAd() {
  return (
    <div className="container px-4 my-4" aria-label="Mobil uygulama tanıtım alanı">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-black text-white">Nöbetçi Eczanem Web</strong>
              <span className="text-[10px] font-bold bg-red-900/80 text-red-200 px-1.5 py-0.2 rounded border border-red-700">
                ÜCRETSİZ
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Telefonunuzun tarayıcısından eczane ve hastane araması yapın.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shrink-0"
        >
          <Download size={14} />
          <span>Eczaneleri Gör</span>
        </Link>
      </div>
    </div>
  );
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="page-intro py-4">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="text-xl sm:text-2xl font-black">{title}</h1>
        <p className="page-intro-description text-xs sm:text-sm text-gray-500">{description}</p>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="section-heading mb-4">
      <p className="eyebrow uppercase font-bold text-red-600 text-xs tracking-wider">{eyebrow}</p>
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{title}</h2>
      {description && <p className="text-xs sm:text-sm text-gray-600 mt-0.5 max-w-2xl">{description}</p>}
    </div>
  );
}
