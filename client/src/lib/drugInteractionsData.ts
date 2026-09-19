// Drug-Drug and Drug-Food Interactions Database for Health Portal

export interface DrugInteractionRule {
  itemA: string;
  itemB: string;
  category: "İlaç - İlaç" | "İlaç - Besin / İçecek";
  severity: "Kritik (Birlikte Kullanılmaz)" | "Önemli (Doktor Kontrolü Gerekli)" | "Hafif / Dikkat Edilmeli";
  severityLevel: 1 | 2 | 3; // 1: Critical, 2: Moderate, 3: Mild
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
}

export const COMMON_MEDICATIONS_FOODS = [
  "Parasetamol (Parol, Minoset vb.)",
  "Alkol",
  "Greyfurt ve Greyfurt Suyu",
  "İbuprofen / NSAİİ (Arvelex, Dolorex, Majezik vb.)",
  "Aspirin (Asetilsalisilik Asit)",
  "Süt ve Yoğurt (Kalsiyum İçeren Gıdalar)",
  "Antibiyotik (Siprofloksasin / Tetrasiklin vb.)",
  "Kan Sulandırıcı (Varfarin / Coumadin)",
  "Tansiyon İlacı (Amlodipin / Diltiazem)",
  "Kolesterol İlacı (Atorvastatin / Rosuvastatin)",
  "Demir İlacı (Ferro Sanol / Maltofer)",
  "Çay ve Kahve (Tanen & Kafein)",
  "Mide Koruyucu / Antiasit (Rennie, Gaviscon, Lansor)",
  "Tiroit İlacı (Levotiroksin / Euthyrox)",
  "Antidepresan (SSRI / MAOI / Cipralex, Lustral)",
  "Muz ve Potasyum Zengini Besinler",
  "Sarımsak ve Ginkgo Biloba Takviyeleri"
];

export const DRUG_INTERACTION_RULES: DrugInteractionRule[] = [
  {
    itemA: "Parasetamol (Parol, Minoset vb.)",
    itemB: "Alkol",
    category: "İlaç - Besin / İçecek",
    severity: "Kritik (Birlikte Kullanılmaz)",
    severityLevel: 1,
    mechanism: "Alkol, karaciğerde CYP2E1 enzimini uyararak parasetamolün toksik ara ürünü olan NAPQI üretimini katlar.",
    clinicalEffect: "Akut karaciğer yetmezliği ve şiddetli hepatotoksisite riski.",
    recommendation: "Parasetamol kullanırken alkol tüketmeyiniz. Kronik alkol tüketen bireylerde günlük doz 2 gramı aşmamalıdır."
  },
  {
    itemA: "Greyfurt ve Greyfurt Suyu",
    itemB: "Kolesterol İlacı (Atorvastatin / Rosuvastatin)",
    category: "İlaç - Besin / İçecek",
    severity: "Kritik (Birlikte Kullanılmaz)",
    severityLevel: 1,
    mechanism: "Greyfurttaki furanokumarinler, bağırsaktaki CYP3A4 enzimini kalıcı olarak bloke eder.",
    clinicalEffect: "Kandaki ilaç konsantrasyonu 5-10 katına çıkarak rabdomiyoliz (şiddetli kas erimesi) ve böbrek yetmezliğine yol açabilir.",
    recommendation: "Statin grubu kolesterol ilacı kullananlar greyfurt ve greyfurt suyu tüketmekten kesinlikle kaçınmalıdır."
  },
  {
    itemA: "Greyfurt ve Greyfurt Suyu",
    itemB: "Tansiyon İlacı (Amlodipin / Diltiazem)",
    category: "İlaç - Besin / İçecek",
    severity: "Önemli (Doktor Kontrolü Gerekli)",
    severityLevel: 2,
    mechanism: "Kalsiyum kanal blokerlerinin yıkımını engelleyerek plazma seviyelerini aşırı yükseltir.",
    clinicalEffect: "Ani ve tehlikeli tansiyon düşüşü (hipotansiyon), baş dönmesi, bayılma ve çarpıntı.",
    recommendation: "Tansiyon ilacınızı alırken greyfurt suyu içmeyiniz; portakal ve mandalina tercih ediniz."
  },
  {
    itemA: "Aspirin (Asetilsalisilik Asit)",
    itemB: "İbuprofen / NSAİİ (Arvelex, Dolorex, Majezik vb.)",
    category: "İlaç - İlaç",
    severity: "Kritik (Birlikte Kullanılmaz)",
    severityLevel: 1,
    mechanism: "İki ilacın trombosit agregasyonunu ve mide mukozasını koruyan COX-1 enzimini aynı anda çift taraflı baskılaması.",
    clinicalEffect: "Mide ve onikiparmak bağırsağında akut kanama, ülser perforasyonu ve böbrek fonksiyon kaybı.",
    recommendation: "Aynı anda iki farklı antiromatizmal/ağrı kesici kullanmayınız. Doktorunuza danışarak tekli rejim uygulayınız."
  },
  {
    itemA: "Kan Sulandırıcı (Varfarin / Coumadin)",
    itemB: "Aspirin (Asetilsalisilik Asit)",
    category: "İlaç - İlaç",
    severity: "Kritik (Birlikte Kullanılmaz)",
    severityLevel: 1,
    mechanism: "Hem pıhtılaşma faktörlerinin sentezinin (K vitamini döngüsü) hem de trombosit fonksiyonlarının çifte bloke edilmesi.",
    clinicalEffect: "İç kanama, beyin kanaması ve durdurulamayan gastrointestinal kanamalar.",
    recommendation: "Kardiyoloğunuz veya hematoloğunuz çok özel bir endikasyon belirtmediği sürece asla bir arada alınmamalıdır."
  },
  {
    itemA: "Süt ve Yoğurt (Kalsiyum İçeren Gıdalar)",
    itemB: "Antibiyotik (Siprofloksasin / Tetrasiklin vb.)",
    category: "İlaç - Besin / İçecek",
    severity: "Önemli (Doktor Kontrolü Gerekli)",
    severityLevel: 2,
    mechanism: "Sütteki kalsiyum iyonları antibiyotik molekülüne bağlanarak çözünmeyen 'şelat' kompleksi oluşturur.",
    clinicalEffect: "Antibiyotiğin kana geçişi %60-80 oranında düşer, enfeksiyon tedavisi başarısız olur.",
    recommendation: "Süt ve süt ürünlerini antibiyotiği aldıktan en az 2 saat önce veya 2 saat sonra tüketiniz."
  },
  {
    itemA: "Demir İlacı (Ferro Sanol / Maltofer)",
    itemB: "Çay ve Kahve (Tanen & Kafein)",
    category: "İlaç - Besin / İçecek",
    severity: "Önemli (Doktor Kontrolü Gerekli)",
    severityLevel: 2,
    mechanism: "Çaydaki tanik asit ve kahvedeki polifenoller demir iyonlarıyla presipite olarak emilimini engeller.",
    clinicalEffect: "Demir eksikliği anemisi tedavisinin etkisiz kalması.",
    recommendation: "Demir ilacınızı aç karnına C vitamini (örneğin portakal suyu) ile alınız; çay ve kahve ile arasında en az 2 saat bırakınız."
  },
  {
    itemA: "Tiroit İlacı (Levotiroksin / Euthyrox)",
    itemB: "Mide Koruyucu / Antiasit (Rennie, Gaviscon, Lansor)",
    category: "İlaç - İlaç",
    severity: "Önemli (Doktor Kontrolü Gerekli)",
    severityLevel: 2,
    mechanism: "Antiasitlerdeki kalsiyum/alüminyum tuzları ve mide asidinin düşmesi levotiroksin emilimini engeller.",
    clinicalEffect: "Hipotiroidi belirtilerinin nüksetmesi (halsizlik, kilo alma, TSH yükselmesi).",
    recommendation: "Tiroit ilacınızı sabah aç karnına tek başına içiniz. Mide ilacı veya antiasit alacaksanız en az 4 saat bekleyiniz."
  },
  {
    itemA: "Kan Sulandırıcı (Varfarin / Coumadin)",
    itemB: "Sarımsak ve Ginkgo Biloba Takviyeleri",
    category: "İlaç - Besin / İçecek",
    severity: "Önemli (Doktor Kontrolü Gerekli)",
    severityLevel: 2,
    mechanism: "Ginkgolidler ve allisin doğal antiagregan etki göstererek kanama zamanını uzatır.",
    clinicalEffect: "Spontan burun, diş eti veya gastrointestinal kanama riski.",
    recommendation: "Bitkisel takviyeleri hekiminize danışmadan kullanmayınız ve INR takibinizi aksatmayınız."
  }
];

export function checkInteraction(item1: string, item2: string): DrugInteractionRule | null {
  if (!item1 || !item2 || item1 === item2) return null;

  return DRUG_INTERACTION_RULES.find(
    (rule) =>
      (rule.itemA === item1 && rule.itemB === item2) ||
      (rule.itemA === item2 && rule.itemB === item1)
  ) || null;
}
