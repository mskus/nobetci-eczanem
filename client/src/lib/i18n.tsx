import React, { createContext, useContext, useEffect, useState } from "react";

export type SupportedLang = "tr" | "en" | "ar" | "ru" | "de";

export interface LangOption {
  code: SupportedLang;
  label: string;
  nativeName: string;
  shortLabel: string;
  flag: string;
  flagCode: string;
  flagUrl: string;
  locale: string;
  dir: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: LangOption[] = [
  {
    code: "tr",
    label: "Turkish",
    nativeName: "Türkçe",
    shortLabel: "TR",
    flag: "🇹🇷",
    flagCode: "tr",
    flagUrl: "https://flagcdn.com/w40/tr.png",
    locale: "tr_TR",
    dir: "ltr",
  },
  {
    code: "en",
    label: "English",
    nativeName: "English",
    shortLabel: "GB",
    flag: "🇬🇧",
    flagCode: "gb",
    flagUrl: "https://flagcdn.com/w40/gb.png",
    locale: "en_US",
    dir: "ltr",
  },
  {
    code: "de",
    label: "German",
    nativeName: "Deutsch",
    shortLabel: "DE",
    flag: "🇩🇪",
    flagCode: "de",
    flagUrl: "https://flagcdn.com/w40/de.png",
    locale: "de_DE",
    dir: "ltr",
  },
  {
    code: "ar",
    label: "Arabic",
    nativeName: "العربية",
    shortLabel: "SA",
    flag: "🇸🇦",
    flagCode: "sa",
    flagUrl: "https://flagcdn.com/w40/sa.png",
    locale: "ar_SA",
    dir: "rtl",
  },
  {
    code: "ru",
    label: "Russian",
    nativeName: "Русский",
    shortLabel: "RU",
    flag: "🇷🇺",
    flagCode: "ru",
    flagUrl: "https://flagcdn.com/w40/ru.png",
    locale: "ru_RU",
    dir: "ltr",
  },
];

const STORAGE_KEY = "nobetci_eczanem_lang_v1";

export function detectInitialLanguage(): SupportedLang {
  if (typeof window === "undefined") return "tr";

  // 1. Check URL query parameter (?lang=en, ?lang=ar, ?lang=ru, ?lang=de, ?lang=tr) for SEO & direct links
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang")?.toLowerCase();
    if (
      urlLang === "tr" ||
      urlLang === "en" ||
      urlLang === "ar" ||
      urlLang === "ru" ||
      urlLang === "de"
    ) {
      localStorage.setItem(STORAGE_KEY, urlLang);
      return urlLang;
    }
  } catch {
    // ignore
  }

  // 2. Check saved user preference in localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
    if (
      saved === "tr" ||
      saved === "en" ||
      saved === "ar" ||
      saved === "ru" ||
      saved === "de"
    ) {
      return saved;
    }
  } catch {
    // ignore
  }

  // 3. Auto-detect from phone / computer browser language (navigator.languages / navigator.language)
  try {
    const browserLangs =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language || "tr"];

    for (const raw of browserLangs) {
      const prefix = raw.toLowerCase().split("-")[0];
      if (prefix === "tr") return "tr";
      if (prefix === "en") return "en";
      if (prefix === "ar") return "ar";
      if (prefix === "ru") return "ru";
      if (prefix === "de") return "de";
    }
  } catch {
    // ignore
  }

  return "tr";
}

export interface UITranslations {
  brandTop: string;
  brandSub: string;
  navDutyPharmacies: string;
  navLiveBadge: string;
  navNearestHospital: string;
  navEmergencyBadge: string;
  navDrugGuide: string;
  navPricesBadge: string;
  navHealthPortal: string;
  navToolsBadge: string;
  navAllPharmacies: string;
  navHealthInTurkey: string;
  navTokenData: string;
  navFirstAid: string;
  navSgkCalc: string;
  navDrugInteraction: string;
  navBloodDonation: string;
  navDrugRecall: string;
  navAirPollen: string;
  mobileBottomDuty: string;
  mobileBottomHospital: string;
  mobileBottomDrugs: string;
  mobileBottomTools: string;
  mobileBottomAllMenu: string;
  langBarTitle: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroTitleSuffix: string;
  mapExpand: string;
  mapCollapse: string;
  selectCityLabel: string;
  selectDistrictLabel: string;
  allDistrictsOption: string;
  showDutyPharmaciesBtn: string;
  locationListedStatus: string;
  locationFallbackStatus: string;
  refreshGpsBtn: string;
  sortedByNearestBadge: string;
  allDistrictsText: string;
  dutyPharmaciesHeading: string;
  dayYesterday: string;
  dayToday: string;
  dayTomorrow: string;
  dutyPharmacyBadge: string;
  callBtn: string;
  directionsBtn: string;
  shareBtn: string;
  addressDirectionTag: string;
  yourLocationPopup: string;
  seoTitleTemplate: (area: string) => string;
  seoDescTemplate: (area: string) => string;
  seoKeywords: string;
  multilingualSeoHeading: string;
  multilingualSeoSub: string;
  faqHeading: string;
  faqSubheading: string;
  faqs: Array<{ category: string; question: string; answer: string }>;
}

export const UI_DICTIONARY: Record<SupportedLang, UITranslations> = {
  tr: {
    brandTop: "Nöbetçi",
    brandSub: "Eczanem",
    navDutyPharmacies: "Nöbetçi Eczaneler",
    navLiveBadge: "CANLI",
    navNearestHospital: "En Yakın Hastane",
    navEmergencyBadge: "7/24 ACİL",
    navDrugGuide: "İlaç Rehberi",
    navPricesBadge: "FİYATLAR",
    navHealthPortal: "Sağlık Portalı",
    navToolsBadge: "ARAÇLAR",
    navAllPharmacies: "Tüm Eczaneler",
    navHealthInTurkey: "Türkiye'de Sağlık",
    navTokenData: "Token & Veri",
    navFirstAid: "7/24 Acil İlk Yardım",
    navSgkCalc: "SGK Katkı Hesapla",
    navDrugInteraction: "İlaç Etkileşim Testi",
    navBloodDonation: "Kızılay Kan Bağışı",
    navDrugRecall: "İlaç Toplatma (TİTCK)",
    navAirPollen: "Hava & Polen Riski",
    mobileBottomDuty: "Nöbetçi",
    mobileBottomHospital: "Hastane",
    mobileBottomDrugs: "İlaç Rehberi",
    mobileBottomTools: "Araçlar",
    mobileBottomAllMenu: "Tüm Menü",
    langBarTitle: "Dil Seçimi:",
    heroTitlePrefix: "En Yakın",
    heroTitleHighlight: "Nöbetçi Eczaneyi",
    heroTitleSuffix: "Bul",
    mapExpand: "Haritayı Büyüt",
    mapCollapse: "Küçült",
    selectCityLabel: "1. Şehir (İl) Seçin:",
    selectDistrictLabel: "2. İlçe Seçin:",
    allDistrictsOption: "Tüm İlçeler",
    showDutyPharmaciesBtn: "Nöbetçi Eczaneleri Göster",
    locationListedStatus: "Konuma göre listelendi.",
    locationFallbackStatus: "Konum bilgisi alınamadı, elle adres giriniz.",
    refreshGpsBtn: "GPS Yenile",
    sortedByNearestBadge: "En yakından en uzağa göre sıralandı",
    allDistrictsText: "TÜM İLÇELER",
    dutyPharmaciesHeading: "Nöbetçi Eczaneler",
    dayYesterday: "Dün",
    dayToday: "Bugün",
    dayTomorrow: "Yarın",
    dutyPharmacyBadge: "NÖBETÇİ ECZANE",
    callBtn: "Ara",
    directionsBtn: "Yol Tarifi",
    shareBtn: "Paylaş",
    addressDirectionTag: "TARİF",
    yourLocationPopup: "Sizin Konumunuz",
    seoTitleTemplate: (area: string) =>
      `${area} Nöbetçi Eczaneler (Bugün Açık) · En Yakın Eczane Bul | Nöbetçi Eczanem`,
    seoDescTemplate: (area: string) =>
      `${area} bölgesinde şu anda açık olan nöbetçi eczaneler, adres tarifleri, telefon numaraları ve harita yol tarifi. 81 il canlı nöbetçi eczane ve 7/24 acil hastane rehberi.`,
    seoKeywords:
      "nöbetçi eczane, en yakın nöbetçi eczane, bugün açık eczane, gece açık eczane, en yakın hastane, ilaç fiyatları 2026",
    multilingualSeoHeading: "Uluslararası Ziyaretçi & Turist Sağlık Rehberi (TR / EN / AR / RU / DE)",
    multilingualSeoSub:
      "Türkiye'deki turistler, yabancı uyruklu sakinler ve uluslararası ziyaretçiler için 5 dilde 7/24 açık nöbetçi eczane ve acil hastane erişimi.",
    faqHeading: "Sıkça Sorulan Sorular (SSS)",
    faqSubheading: "Nöbetçi eczaneler, acil servisler, SGK ilaç katkı payları ve resmi sağlık hizmetleri hakkında merak edilenler.",
    faqs: [
      {
        category: "Nöbetçi Eczane",
        question: "Nöbetçi eczaneler saat kaça kadar açık kalır?",
        answer: "Türkiye'de nöbetçi eczaneler akşam mesai bitiminden (19:00) başlayarak ertesi sabah saat 09:00'a kadar kesintisiz açık kalır. Pazar günleri ve resmi tatillerde ise tam 24 saat boyunca hizmet verir.",
      },
      {
        category: "Fiyat & Ücret",
        question: "Nöbetçi eczanelerde gece ekstra ilaç fiyat farkı alınır mı?",
        answer: "Hayır. Nöbetçi eczanelerde gece, hafta sonu veya tatil günlerinde ekstra bir 'nöbet hizmet ücreti' veya fiyat farkı alınmaz. İlaç perakende satış fiyatları TİTCK ve SGK tarafından belirlenen resmi fiyatlardır.",
      },
      {
        category: "Konum & GPS",
        question: "Konumuma en yakın nöbetçi eczane ve acil hastane nasıl bulunur?",
        answer: "Nöbetçi Eczanem ana sayfasında cihazınızın GPS konumunu onayladığınızda, bulunduğunuz noktaya en yakın nöbetçi eczaneler ve 7/24 acil hastaneler metre bazında hesaplanarak en yakından en uzağa doğru sıralanır.",
      },
      {
        category: "Reçete & İlaç",
        question: "Reçetesiz ilaçlar nöbetçi eczaneden satın alınabilir mi?",
        answer: "Reçetesiz satılmasına izin verilen ağrı kesici, vitamin, takviye gıda ve kişisel bakım ürünleri nöbetçi eczanelerden 7/24 temin edilebilir. Ancak kırmızı/yeşil reçeteli ilaçlar ve antibiyotikler doktor reçetesi gerektirir.",
      },
      {
        category: "SGK & Ödeme",
        question: "SGK ilaç katkı payı çalışan ve emeklilerde yüzde kaçtır?",
        answer: "Sosyal Güvenlik Kurumu (SGK) kapsamında aktif çalışan sigortalılardan ve bakmakla yükümlü oldukları kişilerden %20, emekli, dul ve yetim aylığı alan vatandaşlarımızdan ise %10 oranında ilaç katılım payı alınır.",
      },
      {
        category: "Acil Hastane",
        question: "Acil servis ve Aile Sağlığı Merkezleri (ASM) 7/24 açık mıdır?",
        answer: "Devlet hastaneleri, şehir hastaneleri ve eğitim araştırma hastanelerinin acil servisleri 7/24 kesintisiz hizmet verir. Aile Sağlığı Merkezleri (sağlık ocakları) ise hafta içi 08:00 - 17:00 saatleri arasında hizmet sunar.",
      },
    ],
  },
  en: {
    brandTop: "Duty",
    brandSub: "Pharmacy TR",
    navDutyPharmacies: "Duty Pharmacies",
    navLiveBadge: "LIVE",
    navNearestHospital: "Nearest Hospital",
    navEmergencyBadge: "24/7 ER",
    navDrugGuide: "Medicine Guide",
    navPricesBadge: "PRICES",
    navHealthPortal: "Health Portal",
    navToolsBadge: "TOOLS",
    navAllPharmacies: "All Pharmacies",
    navHealthInTurkey: "Health in Turkey",
    navTokenData: "API & Data",
    navFirstAid: "24/7 First Aid Guide",
    navSgkCalc: "Co-Pay Calculator",
    navDrugInteraction: "Drug Interaction Check",
    navBloodDonation: "Red Crescent Blood",
    navDrugRecall: "Drug Recalls (TITCK)",
    navAirPollen: "Air & Pollen Index",
    mobileBottomDuty: "Duty Map",
    mobileBottomHospital: "Hospital",
    mobileBottomDrugs: "Medicines",
    mobileBottomTools: "Tools",
    mobileBottomAllMenu: "Menu",
    langBarTitle: "Language:",
    heroTitlePrefix: "Find Nearest",
    heroTitleHighlight: "Pharmacy on Duty",
    heroTitleSuffix: "Now",
    mapExpand: "Expand Map",
    mapCollapse: "Shrink Map",
    selectCityLabel: "1. Select Province (City):",
    selectDistrictLabel: "2. Select District:",
    allDistrictsOption: "All Districts",
    showDutyPharmaciesBtn: "Show Pharmacies on Duty",
    locationListedStatus: "Sorted by your GPS location.",
    locationFallbackStatus: "Location unavailable, please select city manually.",
    refreshGpsBtn: "Refresh GPS",
    sortedByNearestBadge: "Sorted from nearest to farthest",
    allDistrictsText: "ALL DISTRICTS",
    dutyPharmaciesHeading: "Pharmacies on Duty (Open 24/7)",
    dayYesterday: "Yesterday",
    dayToday: "Today",
    dayTomorrow: "Tomorrow",
    dutyPharmacyBadge: "ON-DUTY PHARMACY",
    callBtn: "Call",
    directionsBtn: "Directions",
    shareBtn: "Share",
    addressDirectionTag: "LANDMARK",
    yourLocationPopup: "Your Location",
    seoTitleTemplate: (area: string) =>
      `${area} Pharmacy on Duty (Open 24/7 Today) · Nearest Open Pharmacy in Turkey`,
    seoDescTemplate: (area: string) =>
      `Find open 24/7 on-duty pharmacies (Nöbetçi Eczane) in ${area}, Turkey. Live GPS map, walking/driving directions, phone numbers, and nearest emergency hospitals.`,
    seoKeywords:
      "pharmacy on duty turkey, open pharmacy near me istanbul, 24 hour pharmacy antalya, night pharmacy ankara izmir, emergency hospital turkey, medicine prices turkey",
    multilingualSeoHeading: "24/7 On-Duty Pharmacies & Emergency Healthcare in Turkey (TR / EN / AR / RU / DE)",
    multilingualSeoSub:
      "Instant GPS locator for tourists, expats, and residents across all 81 provinces and 973 districts of Turkey.",
    faqHeading: "Frequently Asked Questions (FAQ)",
    faqSubheading: "Everything you need to know about 24/7 duty pharmacies, emergency hospitals, and healthcare in Turkey.",
    faqs: [
      {
        category: "Duty Pharmacy",
        question: "What hours are on-duty pharmacies open in Turkey?",
        answer: "On-duty pharmacies (Nöbetçi Eczane) in Turkey operate continuously from 19:00 (7 PM) in the evening until 09:00 (9 AM) the following morning on weekdays and Saturdays. On Sundays and public holidays, they stay open for a full 24 hours.",
      },
      {
        category: "Prices & Fees",
        question: "Is there an extra night fee at duty pharmacies?",
        answer: "No. Official medicine prices in Turkey are fixed nationwide by the Ministry of Health (TITCK). Duty pharmacies do not charge any extra night service fee or surcharge.",
      },
      {
        category: "GPS Location",
        question: "How do I find the nearest open pharmacy or emergency hospital?",
        answer: "Enable GPS location on Nöbetçi Eczanem, and our system will instantly calculate walking and driving distances to the closest open duty pharmacies and 24/7 hospital emergency rooms.",
      },
      {
        category: "Prescriptions",
        question: "Can I buy over-the-counter medicine without a Turkish prescription?",
        answer: "Yes, common over-the-counter medicines such as pain relievers, cold medications, vitamins, and first-aid supplies can be purchased directly. Antibiotics and controlled medications require a doctor's prescription.",
      },
      {
        category: "Insurance & Co-Pay",
        question: "How does prescription co-payment work under SGK insurance?",
        answer: "Under Turkish SGK social security, active employees pay a 20% medicine co-payment fee, while retirees pay 10%, which is deducted directly from their pension or collected at the pharmacy.",
      },
      {
        category: "Emergency Care",
        question: "Which hospitals in Turkey have 24/7 Emergency Rooms (ER)?",
        answer: "All state hospitals (Devlet Hastanesi), city hospitals (Şehir Hastanesi), and university training hospitals have 24/7 ER units. In medical emergencies, dial 112 for free 24/7 ambulance response.",
      },
    ],
  },
  ar: {
    brandTop: "صيدلية",
    brandSub: "مناوبة تركيا",
    navDutyPharmacies: "الصيدليات المناوبة",
    navLiveBadge: "مباشر",
    navNearestHospital: "أقرب مستشفى",
    navEmergencyBadge: "طوارئ 24/7",
    navDrugGuide: "دليل وأسعار الأدوية",
    navPricesBadge: "الأسعار",
    navHealthPortal: "البوابة الصحية",
    navToolsBadge: "أدوات",
    navAllPharmacies: "جميع الصيدليات",
    navHealthInTurkey: "الصحة في تركيا",
    navTokenData: "البيانات",
    navFirstAid: "الإسعافات الأولية 24/7",
    navSgkCalc: "حاسبة التأمين الصحي",
    navDrugInteraction: "فحص تفاعل الأدوية",
    navBloodDonation: "التبرع بالدم (الهلال الأحمر)",
    navDrugRecall: "سحب الأدوية (TİTCK)",
    navAirPollen: "جودة الهواء وحبوب اللقاح",
    mobileBottomDuty: "المناوبة",
    mobileBottomHospital: "مستشفى",
    mobileBottomDrugs: "الأدوية",
    mobileBottomTools: "أدوات",
    mobileBottomAllMenu: "القائمة",
    langBarTitle: "اللغة:",
    heroTitlePrefix: "اعثر على أقرب",
    heroTitleHighlight: "صيدلية مناوبة مفتوحة",
    heroTitleSuffix: "الآن",
    mapExpand: "تكبير الخريطة",
    mapCollapse: "تصغير الخريطة",
    selectCityLabel: "1. اختر المدينة (الولاية):",
    selectDistrictLabel: "2. اختر المنطقة (الحي):",
    allDistrictsOption: "جميع المناطق",
    showDutyPharmaciesBtn: "عرض الصيدليات المناوبة المفتوحة",
    locationListedStatus: "تم الترتيب حسب موقعك الحالي.",
    locationFallbackStatus: "تعذر تحديد الموقع، يرجى اختيار المدينة يدوياً.",
    refreshGpsBtn: "تحديث الموقع",
    sortedByNearestBadge: "مرتبة من الأقرب إلى الأبعد",
    allDistrictsText: "جميع المناطق",
    dutyPharmaciesHeading: "الصيدليات المناوبة المفتوحة (24 ساعة)",
    dayYesterday: "أمس",
    dayToday: "اليوم",
    dayTomorrow: "غداً",
    dutyPharmacyBadge: "صيدلية مناوبة مفتوحة",
    callBtn: "اتصال",
    directionsBtn: "الاتجاهات",
    shareBtn: "مشاركة",
    addressDirectionTag: "وصف العنوان",
    yourLocationPopup: "موقعك الحالي",
    seoTitleTemplate: (area: string) =>
      `صيدلية مناوبة في ${area} (مفتوحة الآن 24 ساعة) · أقرب صيدلية في تركيا`,
    seoDescTemplate: (area: string) =>
      `ابحث عن أقرب صيدلية مناوبة مفتوحة الآن في ${area}، تركيا. خريطة مباشرة عبر GPS، أرقام الهواتف، اتجاهات الطريق وأقرب مستشفى طوارئ 24/7.`,
    seoKeywords:
      "صيدلية مناوبة تركيا, أقرب صيدلية مفتوحة اسطنبول, صيدلية 24 ساعة أنطاليا, صيدلية ليلية تركيا, أقرب مستشفى طوارئ تركيا, أسعار الأدوية في تركيا",
    multilingualSeoHeading: "دليل الصيدليات المناوبة ومستشفيات الطوارئ في تركيا (TR / EN / AR / RU / DE)",
    multilingualSeoSub:
      "خدمة تحديد الموقع الفوري للسياح والمقيمين في جميع ولايات تركيا الـ 81 على مدار الساعة.",
    faqHeading: "الأسئلة الشائعة (FAQ)",
    faqSubheading: "كل ما تحتاج معرفته عن الصيدليات المناوبة، مستشفيات الطوارئ والرعاية الصحية في تركيا.",
    faqs: [
      {
        category: "الصيدلية المناوبة",
        question: "ما هي ساعات عمل الصيدليات المناوبة في تركيا؟",
        answer: "تعمل الصيدليات المناوبة (Nöbetçi Eczane) في تركيا من الساعة 19:00 مساءً حتى الساعة 09:00 صباح اليوم التالي في أيام العمل. وفي أيام الأحد والعطلات الرسمية تعمل على مدار 24 ساعة كاملة.",
      },
      {
        category: "الأسعار والرسوم",
        question: "هل تفرض رسوم إضافية ليلية في الصيدليات المناوبة؟",
        answer: "لا. أسعار الأدوية في تركيا محددة رسمياً من وزارة الصحة (TİTCK)، ولا تفرض الصيدليات المناوبة أي رسوم إضافية على الخدمة الليلية.",
      },
      {
        category: "تحديد الموقع GPS",
        question: "كيف أجد أقرب صيدلية مفتوحة أو مستشفى طوارئ؟",
        answer: "قم بتفعيل خدمة GPS على موقعنا ليتم حساب المسافة الدقيقة وأقصر الطرق إلى أقرب صيدلية مناوبة ومستشفى طوارئ يعمل 24/7.",
      },
      {
        category: "الوصفات الطبية",
        question: "هل يمكن شراء الأدوية بدون وصفة طبية؟",
        answer: "يمكن شراء مسكنات الألم، الفيتامينات، ومستلزمات الإسعافات الأولية بدون وصفة. بينما تتطلب المضادات الحيوية والأدوية الخاضعة للرقابة وصفة طبيب.",
      },
      {
        category: "التأمين الصحي SGK",
        question: "كم تبلغ نسبة المساهمة الدوائية في التأمين الصحي التركي؟",
        answer: "يدفع الموظفون الخاضعون للتأمين الصحي (SGK) نسبة 20% كحصة مشاركة للأدوية، بينما يدفع المتقاعدون نسبة 10% فقط.",
      },
      {
        category: "طوارئ المستشفيات",
        question: "ما هي المستشفيات التي تضم أقسام طوارئ تعمل 24/7؟",
        answer: "جميع المستشفيات الحكومية ومستشفيات المدن والجامعات تضم أقسام طوارئ تعمل 24/7. في الحالات الطارئة اتصل برقم الإسعاف المجاني 112.",
      },
    ],
  },
  ru: {
    brandTop: "Дежурная",
    brandSub: "Аптека TR",
    navDutyPharmacies: "Дежурные аптеки",
    navLiveBadge: "ОНЛАЙН",
    navNearestHospital: "Ближайшая больница",
    navEmergencyBadge: "24/7 СКОРАЯ",
    navDrugGuide: "Справочник лекарств",
    navPricesBadge: "ЦЕНЫ",
    navHealthPortal: "Портал здоровья",
    navToolsBadge: "СЕРВИСЫ",
    navAllPharmacies: "Все аптеки",
    navHealthInTurkey: "Медициنا в Турции",
    navTokenData: "API и данные",
    navFirstAid: "Первая помощь 24/7",
    navSgkCalc: "Калькулятор SGK",
    navDrugInteraction: "Совместимость лекарств",
    navBloodDonation: "Донорство крови",
    navDrugRecall: "Отзыв лекарств (TİTCK)",
    navAirPollen: "Воздух и пыльца",
    mobileBottomDuty: "Аптеки",
    mobileBottomHospital: "Больницы",
    mobileBottomDrugs: "Лекарства",
    mobileBottomTools: "Сервисы",
    mobileBottomAllMenu: "Меню",
    langBarTitle: "Язык:",
    heroTitlePrefix: "Найти ближайшую",
    heroTitleHighlight: "дежурную аптеку",
    heroTitleSuffix: "сейчас",
    mapExpand: "Увеличить карту",
    mapCollapse: "Свернуть",
    selectCityLabel: "1. Выберите город (ил):",
    selectDistrictLabel: "2. Выберите район:",
    allDistrictsOption: "Все районы",
    showDutyPharmaciesBtn: "Показать дежурные аптеки",
    locationListedStatus: "Отсортировано по вашей геопозиции.",
    locationFallbackStatus: "Геопозиция недоступна, выберите адрес вручную.",
    refreshGpsBtn: "Обновить GPS",
    sortedByNearestBadge: "От ближайшей к самой дальней",
    allDistrictsText: "ВСЕ РАЙОНЫ",
    dutyPharmaciesHeading: "Дежурные аптеки (Открыто 24/7)",
    dayYesterday: "Вчера",
    dayToday: "Сегодня",
    dayTomorrow: "Завтра",
    dutyPharmacyBadge: "ДЕЖУРНАЯ АПТЕКА",
    callBtn: "Позвонить",
    directionsBtn: "Маршрут",
    shareBtn: "Поделиться",
    addressDirectionTag: "ОРИЕНТИР",
    yourLocationPopup: "Ваше местоположение",
    seoTitleTemplate: (area: string) =>
      `Дежурная аптека ${area} (Открыто сейчас 24/7) · Ближайшая аптека в Турции`,
    seoDescTemplate: (area: string) =>
      `Круглосуточные дежурные аптеки (Nöbetçi Eczane) в регионе ${area}, Турция. Онлайн-карта GPS, маршруты проезда, телефоны и ближайшие больницы скорой помощи.`,
    seoKeywords:
      "дежурная аптека турция, круглосуточная аптека анталья, открытая аптека стамбул, ближайшая аптека рядом, скорая помощь больница турция, цены на лекарства в турции",
    multilingualSeoHeading: "Круглосуточные дежурные аптеки и больницы в Турции (TR / EN / AR / RU / DE)",
    multilingualSeoSub:
      "Мгновенный поиск открытых аптек и отделений скорой помощи по GPS для туристов и жителей во всех 81 провинциях Турции.",
    faqHeading: "Часто задаваемые вопросы (FAQ)",
    faqSubheading: "Всё о круглосуточных дежурных аптеках, больницах скорой помощи и медицине в Турции.",
    faqs: [
      {
        category: "Дежурная аптека",
        question: "В каком режиме работают дежурные аптеки в Турции?",
        answer: "Дежурные аптеки (Nöbetçi Eczane) в Турции работают с 19:00 вечера до 09:00 утра следующего дня по будням и субботам. В воскресенье и праздничные дни они работают непрерывно 24 часа.",
      },
      {
        category: "Цены и сборы",
        question: "Берется ли дополнительная плата за ночное обслуживание?",
        answer: "Нет. Цены на лекарства в Турции строго регулируются Министерством здравоохранения (TITCK). В дежурных аптеках нет никаких ночных наценок.",
      },
      {
        category: "Геолокация GPS",
        question: "Как найти ближайшую открытую аптеку или больницу?",
        answer: "Включите геолокацию GPS на сайте Nöbetçi Eczanem, и система автоматически рассчитает маршрут до ближайшей дежурной аптеки и отделения скорой помощи.",
      },
      {
        category: "Рецепты",
        question: "Можно ли купить лекарства без рецепта врача?",
        answer: "Обезболивающие, витамины, средства от простуды и перевязочные материалы продаются без рецепта. Антибиотики и рецептурные препараты требуют назначения врача.",
      },
      {
        category: "Страховка SGK",
        question: "Каков размер доплаты за лекарства по страховке SGK?",
        answer: "По государственной страховке SGK работающие граждане оплачивают 20% от стоимости препаратов, а пенсионеры — 10%.",
      },
      {
        category: "Скорая помощь",
        question: "Какие больницы в Турции принимают круглосуточно?",
        answer: "Все государственные больницы (Devlet Hastanesi) и университетские клиники имеют круглосуточные отделения скорой помощи (Acil). Бесплатный номер скорой — 112.",
      },
    ],
  },
  de: {
    brandTop: "Bereitschafts",
    brandSub: "Apotheke TR",
    navDutyPharmacies: "Notdienst-Apotheken",
    navLiveBadge: "LIVE",
    navNearestHospital: "Nächstes Krankenhaus",
    navEmergencyBadge: "24/7 NOTFALL",
    navDrugGuide: "Medikamenten-Ratgeber",
    navPricesBadge: "PREISE",
    navHealthPortal: "Gesundheitsportal",
    navToolsBadge: "RECHNER",
    navAllPharmacies: "Alle Apotheken",
    navHealthInTurkey: "Gesundheit in der Türkei",
    navTokenData: "API & Daten",
    navFirstAid: "24/7 Erste Hilfe",
    navSgkCalc: "Zuzahlungsrechner",
    navDrugInteraction: "Wechselwirkungs-Check",
    navBloodDonation: "Blutspende (Roter Halbmond)",
    navDrugRecall: "Arzneimittel-Rückrufe",
    navAirPollen: "Luft & Pollen-Index",
    mobileBottomDuty: "Notdienst",
    mobileBottomHospital: "Spital",
    mobileBottomDrugs: "Medikamente",
    mobileBottomTools: "Rechner",
    mobileBottomAllMenu: "Menü",
    langBarTitle: "Sprache:",
    heroTitlePrefix: "Nächste",
    heroTitleHighlight: "Notdienst-Apotheke",
    heroTitleSuffix: "finden",
    mapExpand: "Karte vergrößern",
    mapCollapse: "Verkleinern",
    selectCityLabel: "1. Provinz (Stadt) wählen:",
    selectDistrictLabel: "2. Bezirk wählen:",
    allDistrictsOption: "Alle Bezirke",
    showDutyPharmaciesBtn: "Notdienst-Apotheken anzeigen",
    locationListedStatus: "Nach Ihrem GPS-Standort sortiert.",
    locationFallbackStatus: "Standort nicht verfügbar, bitte Stadt manuell wählen.",
    refreshGpsBtn: "GPS aktualisieren",
    sortedByNearestBadge: "Von der nächstgelegenen zur entferntesten sortiert",
    allDistrictsText: "ALLE BEZIRKE",
    dutyPharmaciesHeading: "Notdienst-Apotheken (24h geöffnet)",
    dayYesterday: "Gestern",
    dayToday: "Heute",
    dayTomorrow: "Morgen",
    dutyPharmacyBadge: "NOTDIENST-APOTHEKE",
    callBtn: "Anrufen",
    directionsBtn: "Route",
    shareBtn: "Teilen",
    addressDirectionTag: "ORIENTIERUNG",
    yourLocationPopup: "Ihr Standort",
    seoTitleTemplate: (area: string) =>
      `${area} Notdienst-Apotheke (Heute 24h geöffnet) · Nächste offene Apotheke Türkei`,
    seoDescTemplate: (area: string) =>
      `Offene 24h Notdienst-Apotheken (Nöbetçi Eczane) in ${area}, Türkei. Live GPS-Karte, Routenplaner, Telefonnummern und Notfall-Krankenhäuser.`,
    seoKeywords:
      "notdienst apotheke türkei, offene apotheke istanbul antalya, 24 stunden apotheke alanya bodrum, krankenhaus notaufnahme türkei, medikamente preise türkei",
    multilingualSeoHeading: "24/7 Notdienst-Apotheken & Notfallmedizin in der Türkei (TR / EN / AR / RU / DE)",
    multilingualSeoSub:
      "Sofortiger GPS-Finder für Urlauber, Expats und Einwohner in allen 81 Provinzen der Türkei.",
    faqHeading: "Häufig gestellte Fragen (FAQ)",
    faqSubheading: "Wichtige Informationen über Notdienst-Apotheken, Krankenhäuser und Gesundheitsversorgung in der Türkei.",
    faqs: [
      {
        category: "Notdienst-Apotheke",
        question: "Wie lange haben Notdienst-Apotheken in der Türkei geöffnet?",
        answer: "Notdienst-Apotheken (Nöbetçi Eczane) in der Türkei sind werktags von 19:00 Uhr abends bis 09:00 Uhr morgens durchgehend geöffnet. An Sonn- und Feiertagen haben sie volle 24 Stunden geöffnet.",
      },
      {
        category: "Preise & Gebühren",
        question: "Fällt in der Nacht ein Aufpreis in der Notdienst-Apotheke an?",
        answer: "Nein. Arzneimittelpreise in der Türkei sind gesetzlich festgelegt. Es wird kein Nacht- oder Feiertagszuschlag erhoben.",
      },
      {
        category: "GPS & Standort",
        question: "Wie finde ich die nächste offene Apotheke oder Notaufnahme?",
        answer: "Aktivieren Sie Ihren GPS-Standort auf Nöbetçi Eczanem, um sofort die nächstgelegene Notdienst-Apotheke sowie Notaufnahmen in Ihrer Nähe mit Routenplaner anzuzeigen.",
      },
      {
        category: "Rezepte",
        question: "Kann man rezeptfreie Medikamente ohne Rezept kaufen?",
        answer: "Ja, rezeptfreie Medikamente wie Schmerzmittel, Erkältungspräparate, Vitamine und Verbandszeug können direkt gekauft werden. Antibiotika erfordern ein ärztliches Rezept.",
      },
      {
        category: "Krankenversicherung",
        question: "Wie hoch ist die Zuzahlung bei der türkischen SGK-Versicherung?",
        answer: "Bei der türkischen Sozialversicherung (SGK) zahlen Erwerbstätige 20% Zuzahlung für Medikamente, während Rentner 10% zahlen.",
      },
      {
        category: "Notfallmedizin",
        question: "Welche Krankenhäuser haben eine 24/7 Notaufnahme?",
        answer: "Alle staatlichen Krankenhäuser (Devlet Hastanesi) und Universitätskliniken verfügen über 24/7 Notaufnahmen. Im Notfall wählen Sie die kostenlose Notrufnummer 112.",
      },
    ],
  },
};

// Synchronize Google Website Translator cookie + widget for full automatic translation of long-form pages/blogs
function syncGoogleTranslateEngine(targetLang: SupportedLang) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  try {
    const cookieValue = targetLang === "tr" ? "" : `/tr/${targetLang}`;
    const hostname = window.location.hostname;

    if (targetLang === "tr") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
    } else {
      document.cookie = `googtrans=${cookieValue}; path=/; SameSite=Lax`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${hostname}; SameSite=Lax`;
    }

    // Ensure Google Translate hidden container exists
    if (!document.getElementById("google_translate_element_hidden")) {
      const holder = document.createElement("div");
      holder.id = "google_translate_element_hidden";
      holder.style.display = "none";
      document.body.appendChild(holder);
    }

    // Load Google Translate script once if a non-Turkish language is requested
    const win = window as unknown as Record<string, unknown>;
    if (!document.getElementById("google-translate-script")) {
      win.googleTranslateElementInit = () => {
        try {
          const g = (window as unknown as { google?: { translate?: { TranslateElement?: new (opts: Record<string, unknown>, id: string) => unknown } } }).google;
          if (g?.translate?.TranslateElement) {
            new g.translate.TranslateElement(
              {
                pageLanguage: "tr",
                includedLanguages: "tr,en,ar,ru,de",
                autoDisplay: false,
              },
              "google_translate_element_hidden"
            );
          }
        } catch {
          // ignore
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Trigger combo change if already loaded
    const triggerSelect = () => {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (select) {
        if (select.value !== targetLang) {
          select.value = targetLang;
          select.dispatchEvent(new Event("change"));
        }
        return true;
      }
      return false;
    };

    if (!triggerSelect()) {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        if (triggerSelect() || attempts > 20) {
          clearInterval(timer);
        }
      }, 300);
    }
  } catch {
    // ignore
  }
}

export function updateMultilingualSEOMeta(lang: SupportedLang, areaText = "Türkiye 81 İl") {
  if (typeof document === "undefined") return;
  const dict = UI_DICTIONARY[lang];
  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  document.documentElement.lang = lang;

  const title = dict.seoTitleTemplate(areaText);
  const desc = dict.seoDescTemplate(areaText);

  document.title = title;

  const setMeta = (selector: string, content: string) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", content);
  };

  setMeta('meta[name="title"]', title);
  setMeta('meta[name="description"]', desc);
  setMeta('meta[name="keywords"]', dict.seoKeywords);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', desc);
  setMeta('meta[property="og:locale"]', langMeta.locale);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', desc);
}

interface LanguageContextValue {
  lang: SupportedLang;
  setLang: (newLang: SupportedLang) => void;
  t: UITranslations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "tr",
  setLang: () => {},
  t: UI_DICTIONARY.tr,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SupportedLang>(() => detectInitialLanguage());

  const setLang = (newLang: SupportedLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      const url = new URL(window.location.href);
      if (newLang === "tr") {
        url.searchParams.delete("lang");
      } else {
        url.searchParams.set("lang", newLang);
      }
      window.history.replaceState({}, "", url.toString());
    } catch {
      // ignore
    }
    updateMultilingualSEOMeta(newLang);
    syncGoogleTranslateEngine(newLang);
  };

  useEffect(() => {
    updateMultilingualSEOMeta(lang);
    if (lang !== "tr") {
      syncGoogleTranslateEngine(lang);
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: UI_DICTIONARY[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
