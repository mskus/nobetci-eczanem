import { ArrowRight, Check, Monitor, Smartphone, Tablet } from "lucide-react";
import { toast } from "sonner";
import { PageIntro } from "@/components/SiteLayout";

const formats = [
  { icon: Monitor, size: "160 × 600", title: "Masaüstü Yan Alan", copy: "Sonuçların yanında, sayfayı bölmeden markanızı görünür kılan dikey alan.", className: "format-tall", label: "Dikey" },
  { icon: Tablet, size: "728 × 90", title: "Sayfa Üstü Banner", copy: "Ana sayfada, ziyaretçinin ilk bakışta göreceği sade ve etkili banner alanı.", className: "format-wide", label: "Yatay" },
  { icon: Smartphone, size: "320 × 100", title: "Mobil Banner", copy: "Mobil kullanıcılar için ekranı kaplamayan, okunaklı ve hızlı banner alanı.", className: "format-mobile", label: "Mobil" },
];

export default function Advertise() {
  const requestAd = () => toast.success("Talep formu yakında açılacak", { description: "Şimdilik hello@nobetcieczanem.com adresinden bize ulaşabilirsiniz." });

  return (
    <main>
      <PageIntro eyebrow="İŞLETMELER İÇİN" title="Markanızı burada görünür hale getirin" description="Nöbetçi Eczanem, ihtiyaç anında eczane arayan binlerce kullanıcıya ulaşmanız için sade ve güvenilir reklam alanları sunar." />
      <section className="advertise-section">
        <div className="container">
          <div className="advertise-intro"><div><p className="eyebrow">REKLAM FORMATLARI</p><h2>İhtiyacınıza uygun görünürlük</h2></div><p>Reklam alanlarımız içeriği bastırmaz. Kullanıcıya yardımcı olan sakin tasarım dilimizi markanız için de koruruz.</p></div>
          <div className="format-grid">
            {formats.map(({ icon: Icon, size, title, copy, className, label }) => <article className="format-card" key={size}><div className={`format-preview ${className}`}><span className="preview-label">{label}</span><div className="preview-line preview-line-one" /><div className="preview-line preview-line-two" /><strong>MARKANIZ</strong></div><div className="format-icon"><Icon size={22} /></div><p className="format-size">{size}</p><h3>{title}</h3><p>{copy}</p><div className="format-includes"><Check size={16} /> Tasarım desteği dahil</div></article>)}
          </div>
          <div className="ad-cta"><div><p className="eyebrow">BİRLİKTE ÇALIŞALIM</p><h2>Markanız için doğru alanı seçelim.</h2><p>İhtiyacınızı anlatın, size uygun reklam formatı ve yayın planı için dönüş yapalım.</p></div><button type="button" className="button button-primary" onClick={requestAd}>Reklam Talebi Oluştur <ArrowRight size={20} /></button></div>
        </div>
      </section>
      <section className="advertise-note"><div className="container advertise-note-inner"><strong>Reklam politikamız</strong><span>Sağlık hizmetleriyle uyumlu, kullanıcı güvenini koruyan içerikleri kabul ediyoruz.</span></div></section>
    </main>
  );
}
