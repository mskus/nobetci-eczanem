// Kızılay Kan Bağışı & Kan Grupları Uyumluluk Rehberi

export interface BloodDonationCenter {
  id: string;
  city: string;
  district: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  lat: number;
  lng: number;
}

export interface BloodTypeCompatibility {
  type: string;
  canGiveTo: string[];
  canReceiveFrom: string[];
  rarityPercent: string;
  isUniversalDonor?: boolean;
  isUniversalReceiver?: boolean;
  notes: string;
}

export const BLOOD_COMPATIBILITY_DATA: BloodTypeCompatibility[] = [
  {
    type: "0 Rh (-)",
    canGiveTo: ["Tüm Kan Grupları (0-, 0+, A-, A+, B-, B+, AB-, AB+)"],
    canReceiveFrom: ["Sadece 0 Rh (-)"],
    rarityPercent: "%5 (Türkiye)",
    isUniversalDonor: true,
    notes: "Genel Verici: Acil travma ve ameliyatlarda kan grubu bilinmeyen hastalara verilen hayati kandır."
  },
  {
    type: "0 Rh (+)",
    canGiveTo: ["0+", "A+", "B+", "AB+"],
    canReceiveFrom: ["0+", "0-"],
    rarityPercent: "%30 (Türkiye'nin en yaygın kan grubu)",
    notes: "En çok aranan ve tüketilen kan grubudur."
  },
  {
    type: "A Rh (+)",
    canGiveTo: ["A+", "AB+"],
    canReceiveFrom: ["A+", "A-", "0+", "0-"],
    rarityPercent: "%37 (Türkiye'de en yüksek oran)",
    notes: "Türkiye nüfusunun en büyük çoğunluğunu oluşturan kan grubudur."
  },
  {
    type: "A Rh (-)",
    canGiveTo: ["A+", "A-", "AB+", "AB-"],
    canReceiveFrom: ["A-", "0-"],
    rarityPercent: "%7 (Türkiye)",
    notes: "Rh negatif kan ihtiyacında kritik öneme sahiptir."
  },
  {
    type: "B Rh (+)",
    canGiveTo: ["B+", "AB+"],
    canReceiveFrom: ["B+", "B-", "0+", "0-"],
    rarityPercent: "%14 (Türkiye)",
    notes: "Düzenli bağışçılara ihtiyaç duyulur."
  },
  {
    type: "B Rh (-)",
    canGiveTo: ["B+", "B-", "AB+", "AB-"],
    canReceiveFrom: ["B-", "0-"],
    rarityPercent: "%2 (Çok Nadir)",
    notes: "Kritik nadir gruptur; bağış yapılması hayati önem taşır."
  },
  {
    type: "AB Rh (+)",
    canGiveTo: ["Sadece AB+"],
    canReceiveFrom: ["Tüm Kan Grupları (Genel Alıcı)"],
    rarityPercent: "%4 (Türkiye)",
    isUniversalReceiver: true,
    notes: "Genel Alıcı: Her gruptan tam kan alabilir; plazma bağışında ise 'Genel Plazma Vericisi'dir."
  },
  {
    type: "AB Rh (-)",
    canGiveTo: ["AB+", "AB-"],
    canReceiveFrom: ["AB-", "A-", "B-", "0-"],
    rarityPercent: "%1 (En Nadir Grup)",
    notes: "Türkiye'de ve dünyada en az bulunan kan grubudur."
  }
];

export const MAJOR_KIZILAY_CENTERS: BloodDonationCenter[] = [
  {
    id: "kizilay-ist-capa",
    city: "İstanbul",
    district: "Fatih",
    name: "Türk Kızılayı Çapa Kan Bağış Merkezi",
    address: "Turgut Özal Millet Cad. No:118, Fatih / İstanbul (Çapa Tıp Fakültesi Karşısı)",
    phone: "0212 531 38 00",
    workingHours: "08:30 - 20:00 (Haftanın 7 Günü)",
    lat: 41.0152,
    lng: 28.9385
  },
  {
    id: "kizilay-ist-kadikoy",
    city: "İstanbul",
    district: "Kadıköy",
    name: "Türk Kızılayı Kadıköy Meydan Kan Alma Birimi",
    address: "Rıhtım Caddesi, İskele Meydanı, Kadıköy / İstanbul",
    phone: "0216 345 00 00",
    workingHours: "09:00 - 21:00 (Her Gün)",
    lat: 40.9904,
    lng: 29.0256
  },
  {
    id: "kizilay-ank-kizilay",
    city: "Ankara",
    district: "Çankaya",
    name: "Türk Kızılayı Ankara Orta Anadolu Bölge Kan Merkezi",
    address: "Kızılay Meydanı, Karanfil Sok. No:5, Çankaya / Ankara",
    phone: "0312 430 00 00",
    workingHours: "08:30 - 20:00",
    lat: 39.9208,
    lng: 32.8541
  },
  {
    id: "kizilay-izm-konak",
    city: "İzmir",
    district: "Konak",
    name: "Türk Kızılayı Ege Bölge Kan Merkezi & Konak Birimi",
    address: "Mithatpaşa Cad. No:45, Konak / İzmir",
    phone: "0232 441 50 50",
    workingHours: "08:30 - 19:30",
    lat: 38.4192,
    lng: 27.1287
  },
  {
    id: "kizilay-bur-heykel",
    city: "Bursa",
    district: "Osmangazi",
    name: "Türk Kızılayı Güney Marmara Kan Merkezi (Heykel)",
    address: "Atatürk Caddesi, Heykel Meydanı, Osmangazi / Bursa",
    phone: "0224 220 00 00",
    workingHours: "09:00 - 19:00",
    lat: 40.1833,
    lng: 29.0633
  },
  {
    id: "kizilay-ant-markantalya",
    city: "Antalya",
    district: "Muratpaşa",
    name: "Türk Kızılayı Batı Akdeniz Kan Merkezi",
    address: "Tahılpazarı Mah. Kazım Özalp Cad., Muratpaşa / Antalya",
    phone: "0242 248 10 00",
    workingHours: "09:00 - 19:30",
    lat: 36.8841,
    lng: 30.7056
  }
];
