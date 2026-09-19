export interface PainkillerInfo {
  brand: string;
  activeIngredient: string;
  category: string;
  priceRange: string;
  indications: string;
  stomachEffect: string;
  usageAdvice: string;
  warnings: string;
}

export const PAINKILLER_GUIDE: PainkillerInfo[] = [
  {
    brand: "Parol / Minoset (500mg)",
    activeIngredient: "Parasetamol",
    category: "Analjezik / Antipiretik (Ateş Düşürücü)",
    priceRange: "40 ₺ - 55 ₺",
    indications: "Hafif ve orta şiddetli baş ağrısı, grip, soğuk algınlığı, aşı sonrası ateş ve vücut kırgınlığı.",
    stomachEffect: "Mideye en zararsız ağrı kesicidir. Ülser veya gastriti olanlarda ilk tercihtir.",
    usageAdvice: "Aç veya tok karnına alınabilir. Günde en fazla 4 gram (8 tablet) aşılmamalıdır.",
    warnings: "Alkol ile kesinlikle karıştırılmamalıdır (karaciğer toksisitesi riski).",
  },
  {
    brand: "Arveles (25mg)",
    activeIngredient: "Deksketoprofen Trometamol",
    category: "NSAİİ (Non-Steroid Antienflamatuar)",
    priceRange: "65 ₺ - 85 ₺",
    indications: "Akut diş ağrısı, kas-iskelet spazmları, operasyon sonrası ağrılar, şiddetli adet sancısı (dismenore).",
    stomachEffect: "Hızlı emilir fakat mide mukozasını tahriş edebilir. Hassas midelerde mide koruyucu önerilir.",
    usageAdvice: "Yemeklerden 30 dakika önce (aç karnına) alınırsa 15-20 dakikada çok hızlı etki gösterir.",
    warnings: "Aktif mide ülseri olanlar ve böbrek yetmezliği bulunanlar kullanmamalıdır.",
  },
  {
    brand: "Majezik (100mg)",
    activeIngredient: "Flurbiprofen",
    category: "NSAİİ (Güçlü Antienflamatuar)",
    priceRange: "70 ₺ - 95 ₺",
    indications: "Şiddetli boğaz iltihabı/ağrısı (sprey/pastil formu da vardır), eklem romatizması, diş çekimi sonrası ağrılar.",
    stomachEffect: "Mide asidini artırabilir, tok karnına alınması esastır.",
    usageAdvice: "Günde 1 veya 2 tablet tok karnına bol su ile yutulmalıdır.",
    warnings: "Kalp-damar hastalığı olanlarda uzun süreli ve kontrolsüz kullanımdan kaçınılmalıdır.",
  },
  {
    brand: "Apranax / Apranax Fort (550mg)",
    activeIngredient: "Naproksen Sodyum",
    category: "NSAİİ (Uzun Etkili Ağrı Kesici)",
    priceRange: "80 ₺ - 115 ₺",
    indications: "Migren atakları, şiddetli bel/boyun fıtığı ağrıları, burkulma, tendon iltihapları ve diş ağrıları.",
    stomachEffect: "Mide duvarına yük bindirebilir. Asla aç karnına alınmamalıdır.",
    usageAdvice: "Mutlaka yemekten sonra dolu mideye bir bardak dolusu su ile alınmalıdır (etkisi 8-12 saat sürer).",
    warnings: "Günde 2 tabletten fazla alınmamalı, diğer ağrı kesicilerle kombine edilmemelidir.",
  },
  {
    brand: "Dolorex / Cataflam (50mg)",
    activeIngredient: "Diklofenak Potasyum",
    category: "NSAİİ (Hızlı Emilen Draje)",
    priceRange: "55 ₺ - 75 ₺",
    indications: "Travma sonrası şişlik ve ağrı, diş eti operasyonları, spor yaralanmaları, böbrek taşı ağrıları.",
    stomachEffect: "Mide koruması olmayan yaşlı hastalarda dikkatli verilmelidir.",
    usageAdvice: "Yemeklerle birlikte veya tok karnına çiğnenmeden yutulmalıdır.",
    warnings: "Astım hastalarında bronkospazmı tetikleyebileceği için doktor danışımı gereklidir.",
  },
  {
    brand: "Nurofen / Dolven / İbofen (200-400mg)",
    activeIngredient: "İbuprofen",
    category: "NSAİİ (Ateş Düşürücü & Antienflamatuar)",
    priceRange: "50 ₺ - 80 ₺",
    indications: "Boğaz enfeksiyonları, kulak iltihabı ağrıları, sinüzit zonklaması, çocuklarda yüksek ateş (şurup formu).",
    stomachEffect: "Mide toleransı orta düzeydedir, tok karnına tercih edilmelidir.",
    usageAdvice: "Yemek sonrası 4-6 saat arayla bol sıvı ile alınabilir.",
    warnings: "Gebelikte (özellikle son trimester) kullanılmamalıdır.",
  },
];
