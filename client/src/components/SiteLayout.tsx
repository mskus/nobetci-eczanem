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
  Syringe,
  ShieldAlert,
  Calculator,
  Wind,
} from "lucide-react";
import { useAdSense } from "@/lib/adsenseService";
import { SUPPORTED_LANGUAGES, useLanguage } from "@/lib/i18n";

type SiteLayoutProps = {
  children: React.ReactNode;
};

export function Brand() {
  const { t } = useLanguage();
  return (
    <Link href="/" className="brand shrink-0" aria-label="Nöbetçi Eczanem ana sayfa">
      <span className="brand-mark" aria-hidden="true">
        <Plus strokeWidth={3.2} />
      </span>
      <span className="brand-copy">
        <strong>{t.brandTop}</strong>
        <span>{t.brandSub}</span>
      </span>
    </Link>
  );
}

export function ProminentLanguageBar({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`notranslate flex items-center justify-center gap-1.5 sm:gap-2.5 ${
        compact ? "py-0.5" : "py-1.5 px-3 bg-slate-100/90 border border-slate-200/90 rounded-2xl shadow-2xs"
      }`}
      role="group"
      aria-label="Language selection / Dil seçimi"
    >
      {SUPPORTED_LANGUAGES.map((item) => {
        const active = lang === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            className={`notranslate cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl font-black transition-all whitespace-nowrap shrink-0 ${
              compact
                ? "px-2 py-1 text-xs"
                : "px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm"
            } ${
              active
                ? "bg-red-600 text-white shadow-md ring-2 ring-red-300 scale-102"
                : "bg-white text-slate-800 hover:bg-red-50 hover:text-red-700 border border-slate-200"
            }`}
            title={`${item.nativeName} (${item.label})`}
            aria-label={`${item.nativeName} (${item.label})`}
          >
            {/* Real Colored Flag Icon */}
            <img
              src={item.flagUrl}
              alt={`${item.label} flag`}
              className="w-5 h-3.5 sm:w-6 sm:h-4 rounded-[3px] object-cover shadow-2xs border border-black/15 shrink-0"
              loading="eager"
            />
            <span className="font-black text-xs sm:text-sm tracking-wide">{item.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <div className="site-shell">
      <header className="site-header sticky top-0 z-40">
        <div className="header-inner">
          <Brand />

          <nav className="desktop-nav flex items-center gap-1" aria-label="Ana navigasyon">
            {/* 1. Nöbetçi Eczaneler */}
            <Link
              href="/"
              className={`relative px-2.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                location === "/"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-gray-800 hover:bg-gray-100 hover:text-gray-950"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>{t.navDutyPharmacies}</span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                  location === "/"
                    ? "bg-red-800 text-white border-red-400"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                {t.navLiveBadge}
              </span>
            </Link>

            {/* 2. En Yakın Hastane */}
            <Link
              href="/en-yakin-hastane"
              className={`relative px-2.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                location === "/en-yakin-hastane"
                  ? "bg-red-700 text-white shadow-xs"
                  : "text-red-700 bg-red-50/90 border border-red-200 hover:bg-red-100"
              }`}
            >
              <HeartPulse
                size={14}
                className={`shrink-0 ${
                  location === "/en-yakin-hastane" ? "text-white" : "text-red-600 animate-pulse"
                }`}
              />
              <span>{t.navNearestHospital}</span>
              <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded shadow-2xs">
                {t.navEmergencyBadge}
              </span>
            </Link>

            {/* 3. İlaç Fiyatları & Rehberi */}
            <Link
              href="/blog"
              className={`px-2.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                location === "/blog"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-amber-900 bg-amber-50/90 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Pill
                size={14}
                className={location === "/blog" ? "text-white shrink-0" : "text-amber-600 shrink-0"}
              />
              <span>{t.navDrugGuide}</span>
              <span className="text-[10px] bg-amber-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                {t.navPricesBadge}
              </span>
            </Link>

            {/* 4. Sağlık Portalı & Araçlar */}
            <Link
              href="/saglik-araclari"
              className={`px-2.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
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
              <Activity size={14} className="shrink-0" />
              <span>{t.navHealthPortal}</span>
              <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                {t.navToolsBadge}
              </span>
            </Link>

            {/* 5. Tüm Eczaneler */}
            <Link
              href="/tum-eczaneler"
              className={`px-2.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                location === "/tum-eczaneler"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <Building2 size={14} className="text-gray-600 shrink-0" />
              <span>{t.navAllPharmacies}</span>
            </Link>

            {/* 6. Türkiye'de Sağlık (WHO) */}
            <Link
              href="/turkiyede-saglik"
              className={`px-2.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                location === "/turkiyede-saglik"
                  ? "bg-cyan-800 text-white shadow-xs"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <Globe2 size={14} className="text-cyan-700 shrink-0" />
              <span>{t.navHealthInTurkey}</span>
            </Link>
          </nav>

          {/* Header Mobile Menu Button (Language selector removed from header) */}
          <div className="header-actions flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              className="mobile-menu-button cursor-pointer shrink-0"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobil Menü: Tek Ekranda Tek Tıkla Tüm Menüler + Büyük Dil Seçimi */}
        {mobileOpen && (
          <nav
            id="mobile-navigation"
            className="mobile-nav p-3 bg-white border-b border-gray-200 shadow-xl"
            aria-label="Mobil navigasyon"
          >
            <div className="mb-2.5">
              <ProminentLanguageBar />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 font-black text-xs text-red-700"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="truncate">1. {t.navDutyPharmacies}</span>
              </Link>

              <Link
                href="/en-yakin-hastane"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 font-black text-xs text-rose-800"
              >
                <HeartPulse size={15} className="text-red-600 shrink-0" />
                <span className="truncate">2. {t.navNearestHospital}</span>
              </Link>

              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center gap-2 font-black text-xs text-amber-900"
              >
                <Pill size={15} className="text-amber-600 shrink-0" />
                <span className="truncate">3. {t.navDrugGuide}</span>
              </Link>

              <Link
                href="/ilk-yardim"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 flex items-center gap-2 font-bold text-xs text-slate-900"
              >
                <Activity size={15} className="text-rose-600 shrink-0" />
                <span className="truncate">4. {t.navFirstAid}</span>
              </Link>

              <Link
                href="/sgk-katki-payi-hesaplayici"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 font-bold text-xs text-emerald-900"
              >
                <Calculator size={15} className="text-emerald-600 shrink-0" />
                <span className="truncate">5. {t.navSgkCalc}</span>
              </Link>

              <Link
                href="/ilac-etkilesim"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2 font-bold text-xs text-indigo-900"
              >
                <Pill size={15} className="text-indigo-600 shrink-0" />
                <span className="truncate">6. {t.navDrugInteraction}</span>
              </Link>

              <Link
                href="/kan-bagisi"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-bold text-xs text-slate-800"
              >
                <Syringe size={15} className="text-red-600 shrink-0" />
                <span className="truncate">7. {t.navBloodDonation}</span>
              </Link>

              <Link
                href="/titck-ilac-geri-cekme"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-bold text-xs text-slate-800"
              >
                <ShieldAlert size={15} className="text-amber-600 shrink-0" />
                <span className="truncate">8. {t.navDrugRecall}</span>
              </Link>

              <Link
                href="/hava-kalitesi-polen"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-bold text-xs text-slate-800"
              >
                <Wind size={15} className="text-cyan-600 shrink-0" />
                <span className="truncate">9. {t.navAirPollen}</span>
              </Link>

              <Link
                href="/tum-eczaneler"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-bold text-xs text-slate-800"
              >
                <Building2 size={15} className="text-slate-700 shrink-0" />
                <span className="truncate">10. {t.navAllPharmacies}</span>
              </Link>

              <Link
                href="/veri-kaynaklari"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center gap-2 font-bold text-xs text-indigo-900"
              >
                <ShieldCheck size={15} className="text-indigo-600 shrink-0" />
                <span className="truncate">11. {t.navTokenData}</span>
              </Link>

              <Link
                href="/turkiyede-saglik"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-bold text-xs text-slate-800"
              >
                <Globe2 size={15} className="text-cyan-700 shrink-0" />
                <span className="truncate">12. {t.navHealthInTurkey}</span>
              </Link>
            </div>
          </nav>
        )}
      </header>

      <div className="pb-20 lg:pb-0">{children}</div>

      {/* Modern Mobil Alt Kayan Navigasyon Barı (İlaç Rehberi Ana Menüde!) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1.5 grid grid-cols-5 items-center shadow-2xl"
        aria-label="Mobil alt navigasyon"
      >
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
            location === "/"
              ? "text-red-600 font-black"
              : "text-slate-500 font-bold hover:text-slate-900"
          }`}
        >
          <div className="relative">
            <Plus className="w-5 h-5 stroke-[2.8]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[10px] tracking-tight truncate">{t.mobileBottomDuty}</span>
        </Link>

        <Link
          href="/en-yakin-hastane"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
            location === "/en-yakin-hastane"
              ? "text-red-600 font-black"
              : "text-slate-500 font-bold hover:text-slate-900"
          }`}
        >
          <HeartPulse className="w-5 h-5" />
          <span className="text-[10px] tracking-tight truncate">{t.mobileBottomHospital}</span>
        </Link>

        <Link
          href="/blog"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
            location === "/blog"
              ? "text-amber-600 font-black bg-amber-50"
              : "text-slate-600 font-bold hover:text-slate-900"
          }`}
        >
          <Pill className="w-5 h-5 text-amber-600" />
          <span className="text-[10px] tracking-tight truncate">{t.mobileBottomDrugs}</span>
        </Link>

        <Link
          href="/saglik-araclari"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
            location.startsWith("/saglik-araclari") ||
            location.startsWith("/sgk-katki-payi") ||
            location.startsWith("/hava-kalitesi") ||
            location.startsWith("/titck") ||
            location.startsWith("/ilac-etkilesim") ||
            location.startsWith("/kan-bagisi") ||
            location.startsWith("/ilk-yardim")
              ? "text-emerald-700 font-black bg-emerald-50"
              : "text-slate-500 font-bold hover:text-slate-900"
          }`}
        >
          <Activity className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] tracking-tight truncate">{t.mobileBottomTools}</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl cursor-pointer ${
            mobileOpen ? "text-red-600 font-black bg-red-50" : "text-slate-500 font-bold hover:text-slate-900"
          }`}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="text-[10px] tracking-tight truncate">{t.mobileBottomAllMenu}</span>
        </button>
      </nav>


      <footer className="site-footer bg-gray-950 text-white pt-12 pb-8 border-t border-gray-800">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800">
            <div className="md:col-span-2 space-y-3">
              <Brand />
              <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed">
                Nöbetçi Eczanem; Türkiye genelinde 81 il ve 973 ilçede açık olan nöbetçi eczaneleri,
                7/24 acil hastaneleri, SGK katkı payı hesaplayıcıyı, polen & hava indeksini, TİTCK
                ilaç geri çekme bültenlerini ve WHO sağlık göstergelerini tek ekranda sunan bağımsız
                sağlık portalıdır.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                Sağlık Portalı & Servisler
              </h4>
              <div className="flex flex-col space-y-2 text-xs font-semibold text-gray-300">
                <Link href="/" className="hover:text-red-400">
                  Nöbetçi Eczaneler (Canlı)
                </Link>
                <Link href="/en-yakin-hastane" className="hover:text-red-400">
                  En Yakın Hastane & ASM
                </Link>
                <Link href="/tum-eczaneler" className="hover:text-white">
                  81 İl Tüm Eczaneler Rehberi
                </Link>
                <Link href="/sgk-katki-payi-hesaplayici" className="hover:text-emerald-400">
                  SGK Katkı Payı Hesaplayıcı
                </Link>
                <Link href="/hava-kalitesi-polen" className="hover:text-cyan-400">
                  Polen & Hava Kalitesi İndeksi
                </Link>
                <Link href="/titck-ilac-geri-cekme" className="hover:text-amber-400">
                  TİTCK İlaç Geri Çekme Bülteni
                </Link>
                <Link href="/kan-bagisi" className="hover:text-red-400">
                  Kızılay Kan Bağış Noktaları
                </Link>
                <Link href="/turkiyede-saglik" className="hover:text-cyan-400">
                  Türkiye'de Sağlık (WHO & UNICEF)
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                Kurumsal & Altyapı
              </h4>
              <div className="flex flex-col space-y-2 text-xs font-semibold text-gray-300">
                <Link href="/blog" className="hover:text-white">
                  İlaç & Sağlık Rehberi (Blog)
                </Link>
                <Link href="/reklam-ver" className="hover:text-white">
                  Reklam & Sponsorluk
                </Link>
                <Link href="/iletisim" className="hover:text-white">
                  Bize Ulaşın / Destek
                </Link>
                <Link href="/veri-kaynaklari" className="text-gray-400 hover:text-white">
                  Veri Kaynakları & API
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <span>
              © 2026 Nöbetçi Eczanem · Sağlık Bakanlığı ve TEB Esaslarına Uygun Bilgilendirme
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/veri-kaynaklari" className="hover:text-gray-300 underline">
                Veri Kaynakları & Tüketim
              </Link>
              <Link href="/iletisim" className="hover:text-gray-300 underline">
                İletişim & Geri Bildirim
              </Link>
              <Link href="/yonetim-kapisi-2026" className="text-gray-600 hover:text-gray-400">
                Yönetim
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AdRail({ side }: { side: "left" | "right" }) {
  const adConfig = useAdSense();
  const isAdSenseActive = adConfig.adsenseEnabled && adConfig.publisherId && adConfig.slots.sidebarRail.enabled;

  return (
    <aside
      className={`hidden 2xl:flex flex-col justify-between fixed top-24 ${
        side === "left" ? "left-4" : "right-4"
      } w-52 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white p-4 rounded-2xl border border-gray-700 shadow-2xl z-20`}
      aria-label={`${side === "left" ? "Sol" : "Sağ"} reklam ve tanıtım alanı`}
      style={{ minHeight: "560px" }}
    >
      {isAdSenseActive && adConfig.slots.sidebarRail.slotId ? (
        <div className="w-full flex-1 flex flex-col justify-center items-center overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: "inline-block", width: "160px", height: "600px" }}
            data-ad-client={adConfig.publisherId}
            data-ad-slot={adConfig.slots.sidebarRail.slotId}
          />
        </div>
      ) : (
        <>
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
            <span className="text-[10px] text-gray-400 block">App Store & Google Play</span>
          </div>
        </>
      )}
    </aside>
  );
}

export function MobileAd() {
  const adConfig = useAdSense();
  const isAdSenseActive = adConfig.adsenseEnabled && adConfig.publisherId && adConfig.slots.mobileSticky.enabled;

  return (
    <div className="container px-4 my-3" aria-label="Mobil reklam ve tanıtım alanı">
      {isAdSenseActive && adConfig.slots.mobileSticky.slotId ? (
        <div className="w-full text-center overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: "inline-block", width: "320px", height: "100px" }}
            data-ad-client={adConfig.publisherId}
            data-ad-slot={adConfig.slots.mobileSticky.slotId}
          />
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-3.5 sm:p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-white">Nöbetçi Eczanem Mobil</strong>
                <span className="text-[10px] font-bold bg-red-900/80 text-red-200 px-1.5 py-0.2 rounded border border-red-700">
                  ÜCRETSİZ
                </span>
              </div>
              <p className="text-xs text-gray-300">
                7/24 Acil nöbetçi eczaneler, en yakın hastaneler ve sesli navigasyon cebinizde!
              </p>
            </div>
          </div>

          <Link
            href="/reklam-ver"
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shrink-0"
          >
            <Download size={14} />
            <span>Uygulamayı İndir</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
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

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading mb-4">
      <p className="eyebrow uppercase font-bold text-red-600 text-xs tracking-wider">{eyebrow}</p>
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{title}</h2>
      {description && (
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 max-w-2xl">{description}</p>
      )}
    </div>
  );
}
