import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Plus, X } from "lucide-react";
import { QuotaBadge } from "./QuotaBadge";
import { useQuota } from "@/hooks/useQuota";

type SiteLayoutProps = {
  children: React.ReactNode;
};

const navItems = [
  { label: "Nöbetçi Eczaneler", href: "/" },
  { label: "Nasıl Çalışır?", href: "/#nasil-calisir" },
  { label: "Veri Kaynakları", href: "/veri-kaynaklari" },
  { label: "Reklam Ver", href: "/reklam-ver" },
];

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

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Ana navigasyon">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={location === item.href ? "nav-link active" : "nav-link"}
              >
                {item.label}
              </Link>
            ))}
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
        {mobileOpen && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobil navigasyon">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="mobile-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      {children}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Brand />
            <p className="footer-note">İhtiyacınız olduğunda açık olan eczaneyi kolayca bulun.</p>
          </div>
          <div className="footer-links">
            <Link href="/">Nöbetçi Eczaneler</Link>
            <Link href="/veri-kaynaklari">Veri Kaynakları</Link>
            <Link href="/reklam-ver">Reklam Ver</Link>
          </div>
          <div className="footer-meta">
            <span>Güvenilir bilgi, sade kullanım.</span>
            <span>© 2026 Nöbetçi Eczanem</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AdRail({ side }: { side: "left" | "right" }) {
  return (
    <aside className={`ad-rail ad-rail-${side}`} aria-label={`${side === "left" ? "Sol" : "Sağ"} reklam alanı`}>
      <span className="ad-label">REKLAM</span>
      <span className="ad-size">160 × 600</span>
      <div className="ad-rail-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <strong>Markanız burada<br />görünsün.</strong>
      <span className="ad-rail-cta">Reklam ver →</span>
    </aside>
  );
}

export function MobileAd() {
  return (
    <div className="mobile-ad" aria-label="Mobil reklam alanı">
      <span>REKLAM</span>
      <strong>728 × 90 banner alanı</strong>
      <span>Yerel kullanıcılarla buluşun →</span>
    </div>
  );
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="page-intro">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-intro-description">{description}</p>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="section-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
