// TİTCK (Türkiye İlaç ve Tıbbi Cihaz Kurumu) and TEB Drug Safety, Recalls & Public Warnings

export interface TitckAlert {
  id: string;
  drugName: string;
  activeIngredient: string;
  barcode: string;
  manufacturer: string;
  recallClass: "1. Sınıf (Kritik / Hayati Tehlike)" | "2. Sınıf (Geçici Sağlık Riski)" | "3. Sınıf (Teknik / Ambalaj Hatası)" | "Sahte/Kaçak Ürün Uyarısı";
  recallClassLevel: 1 | 2 | 3 | 4;
  affectedBatches: string[];
  reason: string;
  officialAnnouncementDate: string;
  status: "Aktif Toplatma" | "Eczane Düzeyinde İade" | "Kullanıcı Bilgilendirme";
  recommendedAction: string;
  sourceUrl: string;
}

export const TITCK_ALERTS: TitckAlert[] = [
  {
    id: "titck-2024-08",
    drugName: "Prednol-L 20 mg Ampul (Enjeksiyonluk)",
    activeIngredient: "Metilprednizolon sodyum süksinat",
    barcode: "8699546750012",
    manufacturer: "M.N. İlaç San. A.Ş.",
    recallClass: "2. Sınıf (Geçici Sağlık Riski)",
    recallClassLevel: 2,
    affectedBatches: ["2401019", "2401020", "2401021"],
    reason: "Üretim partisinde çözünürlük parametrelerinde belirlenen limit dışı sapma tespit edilmesi.",
    officialAnnouncementDate: "14 Ağustos 2024",
    status: "Eczane Düzeyinde İade",
    recommendedAction: "Belirtilen parti numarasına sahip ampulleri hekiminize veya eczacınıza iade ediniz, alternatif parti kullanınız.",
    sourceUrl: "https://www.titck.gov.tr",
  },
  {
    id: "titck-2024-05",
    drugName: "Augmentin-BID 1000 mg 14 Film Tablet",
    activeIngredient: "Amoksisilin + Klavulanik Asit",
    barcode: "8699525093413",
    manufacturer: "GlaxoSmithKline (GSK)",
    recallClass: "3. Sınıf (Teknik / Ambalaj Hatası)",
    recallClassLevel: 3,
    affectedBatches: ["AG24098A", "AG24099B"],
    reason: "Kutu üzeri karekod baskısında bazı serilerde okunamama ve etiketleme hizalama hatası.",
    officialAnnouncementDate: "28 Mayıs 2024",
    status: "Eczane Düzeyinde İade",
    recommendedAction: "İlacın kimyasal ve tıbbi içeriğinde sakınca yoktur; karekod kontrolü için eczanenize danışabilirsiniz.",
    sourceUrl: "https://www.titck.gov.tr",
  },
  {
    id: "titck-2024-03",
    drugName: "Parol 500 mg 20 Tablet (Sahte İlaç Uyarısı)",
    activeIngredient: "Parasetamol",
    barcode: "8699525010014",
    manufacturer: "Atabay İlaç (Yetkisiz Taklit Uyarısı)",
    recallClass: "Sahte/Kaçak Ürün Uyarısı",
    recallClassLevel: 4,
    affectedBatches: ["İnternet ve yetkisiz pazar yerlerinden satılan tüm karekodsuz ürünler"],
    reason: "İnternet sitelerinde ve sosyal medyada sahte ve denetimsiz üretilen taklit ambalajların tespiti.",
    officialAnnouncementDate: "12 Mart 2024",
    status: "Aktif Toplatma",
    recommendedAction: "İlaçlarınızı yalnızca ruhsatlı eczanelerden alınız. İnternetten veya sosyal medyadan asla ilaç sipariş etmeyiniz.",
    sourceUrl: "https://www.titck.gov.tr",
  },
  {
    id: "titck-2023-11",
    drugName: "Calpol 120 mg/5 ml Süspansiyon 150 ml",
    activeIngredient: "Parasetamol",
    barcode: "8699525700014",
    manufacturer: "GlaxoSmithKline",
    recallClass: "3. Sınıf (Teknik / Ambalaj Hatası)",
    recallClassLevel: 3,
    affectedBatches: ["CP23B112"],
    reason: "Kullanma talimatında doz kaşığı mililitre çizgisi baskı tonundaki okunabilirlik kusuru.",
    officialAnnouncementDate: "22 Kasım 2023",
    status: "Kullanıcı Bilgilendirme",
    recommendedAction: "İlaç dozunu verirken standart 5 ml'lik eczane ölçek şırıngası kullanılması tavsiye edilir.",
    sourceUrl: "https://www.titck.gov.tr",
  },
  {
    id: "titck-2023-09",
    drugName: "Ventrex 100 mg/2 ml İnhalasyon Solüsyonu",
    activeIngredient: "Salbutamol",
    barcode: "8699546520110",
    manufacturer: "Deva Holding",
    recallClass: "2. Sınıf (Geçici Sağlık Riski)",
    recallClassLevel: 2,
    affectedBatches: ["VT23049"],
    reason: "Flakon kapağı sızdırmazlık testinde basınç tolerans sınırının altında kalması.",
    officialAnnouncementDate: "05 Eylül 2023",
    status: "Eczane Düzeyinde İade",
    recommendedAction: "Elinizdeki VT23049 partili ürünü en yakın eczaneye teslim ederek yenisiyle değiştiriniz.",
    sourceUrl: "https://www.titck.gov.tr",
  },
  {
    id: "titck-2023-06",
    drugName: "Metpamid 10 mg 30 Tablet",
    activeIngredient: "Metoklopramid",
    barcode: "8699514010018",
    manufacturer: "Sandoz İlaç",
    recallClass: "2. Sınıf (Geçici Sağlık Riski)",
    recallClassLevel: 2,
    affectedBatches: ["MP23081"],
    reason: "Stabilite kontrol testlerinde etken madde dağılım homojenliğinde sapma saptanması.",
    officialAnnouncementDate: "18 Haziran 2023",
    status: "Eczane Düzeyinde İade",
    recommendedAction: "Hekiminize veya eczacınıza danışarak alternatif parti veya muadil ürün temin ediniz.",
    sourceUrl: "https://www.titck.gov.tr",
  }
];
