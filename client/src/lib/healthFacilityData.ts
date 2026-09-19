import { calculateDistanceKm } from "./turkeyGeoData";

export type FacilityType = "hastane" | "saglik_ocagi" | "saglik_kabini";

export interface HealthFacility {
  id: string;
  name: string;
  type: FacilityType;
  typeName: string;
  city: string;
  district: string;
  address: string;
  landmark: string;
  phone: string;
  emergencyPhone?: string;
  is24Hours: boolean;
  services: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
}

export const FACILITY_TYPE_LABELS: Record<FacilityType, { title: string; badge: string; color: string }> = {
  hastane: {
    title: "Hastaneler (Devlet, Şehir & Özel)",
    badge: "7/24 Acil Servis",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  saglik_ocagi: {
    title: "Sağlık Ocakları (Aile Sağlığı Merkezleri)",
    badge: "Hafta İçi 08:00 - 17:00",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  saglik_kabini: {
    title: "Sağlık Kabinleri & Evde Bakım",
    badge: "Enjeksiyon & Pansuman",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const SAMPLE_FACILITIES: HealthFacility[] = [
  // İstanbul - Hastaneler
  {
    id: "ist-h-1",
    name: "Kadıköy Dr. Siyami Ersek Göğüs Kalp ve Damar Cerrahisi EAH",
    type: "hastane",
    typeName: "Eğitim ve Araştırma Hastanesi",
    city: "İstanbul",
    district: "Kadıköy",
    address: "Tıbbiye Cad. No:13, Haydarpaşa, Kadıköy",
    landmark: "Haydarpaşa Numune Hastanesi Yanı & Marmaray Ayrılık Çeşmesi Civarı",
    phone: "0216 542 44 00",
    emergencyPhone: "112",
    is24Hours: true,
    services: ["7/24 Acil Servis", "Kardiyoloji", "Yoğun Bakım", "Görüntüleme / MR", "Laboratuvar"],
    location: { latitude: 41.0025, longitude: 29.0212 },
  },
  {
    id: "ist-h-2",
    name: "İstanbul Başakşehir Çam ve Sakura Şehir Hastanesi",
    type: "hastane",
    typeName: "Şehir Hastanesi",
    city: "İstanbul",
    district: "Başakşehir",
    address: "Olimpiyat Bulvarı Yolu, Başakşehir",
    landmark: "Olimpiyat Stadı Karşısı · Metro Şehir Hastanesi İstasyonu",
    phone: "0212 909 60 00",
    emergencyPhone: "112",
    is24Hours: true,
    services: ["7/24 Çocuk Acil", "Genel Acil", "Travma Merkezi", "Tüm Poliklinikler", "Yanık Ünitesi"],
    location: { latitude: 41.1098, longitude: 28.7754 },
  },
  {
    id: "ist-h-3",
    name: "Şişli Hamidiye Etfal Eğitim ve Araştırma Hastanesi",
    type: "hastane",
    typeName: "Devlet / EAH",
    city: "İstanbul",
    district: "Şişli",
    address: "Halaskargazi Cad. Etfal Sok. No:19, Şişli",
    landmark: "Osmanbey Metro Çıkışı & Pangaltı Meydanı Civarı",
    phone: "0212 373 50 00",
    emergencyPhone: "112",
    is24Hours: true,
    services: ["7/24 Yetişkin Acil", "Çocuk Acil", "Cerrahi", "Dahiliye", "E-Reçete Girişi"],
    location: { latitude: 41.0568, longitude: 28.9882 },
  },

  // İstanbul - Sağlık Ocakları (ASM)
  {
    id: "ist-asm-1",
    name: "Kadıköy 1 No'lu Rasimpaşa Aile Sağlığı Merkezi",
    type: "saglik_ocagi",
    typeName: "Aile Sağlığı Merkezi (ASM)",
    city: "İstanbul",
    district: "Kadıköy",
    address: "Rasimpaşa Mah. Rıhtım Cad. Karakol Sok. No:12, Kadıköy",
    landmark: "Kadıköy Rıhtım İskele Karşısı & Tarihi Çarşı Girişi",
    phone: "0216 336 12 45",
    is24Hours: false,
    services: ["Aile Hekimi Muayenesi", "Rutin Çocuk & Bebek Aşıları", "Kan / İdrar Tahlili", "İlaç Rapor & Reçete"],
    location: { latitude: 40.9932, longitude: 29.0256 },
  },
  {
    id: "ist-asm-2",
    name: "Üsküdar Acıbadem 3 No'lu Aile Sağlığı Merkezi",
    type: "saglik_ocagi",
    typeName: "Aile Sağlığı Merkezi (ASM)",
    city: "İstanbul",
    district: "Üsküdar",
    address: "Acıbadem Mah. Çeçen Sok. No:8, Üsküdar",
    landmark: "Akasya AVM Arkası & Acıbadem Metrobüs Durağı Yakını",
    phone: "0216 325 88 12",
    is24Hours: false,
    services: ["Gebe İzlem", "Kanser Tarama (KETEM)", "Kronik Hastalık Takibi", "Ehliyet Sağlık Raporu"],
    location: { latitude: 41.0018, longitude: 29.0512 },
  },

  // İstanbul - Sağlık Kabinleri
  {
    id: "ist-sk-1",
    name: "Kadıköy Moda Özel Sağlık Kabini & Evde Bakım",
    type: "saglik_kabini",
    typeName: "Ruhsatlı Sağlık Kabini",
    city: "İstanbul",
    district: "Kadıköy",
    address: "Caferağa Mah. Moda Cad. No:44/B, Kadıköy",
    landmark: "Tarihi Moda Tramvay Durağı Karşısı",
    phone: "0216 418 20 20",
    is24Hours: true,
    services: ["Reçeteli Enjeksiyon (İğne)", "Serum Takma & Çıkarma", "Yara Pansumanı & Dikiş Alma", "Evde Sağlık Hizmeti"],
    location: { latitude: 40.9854, longitude: 29.0289 },
  },
  {
    id: "ist-sk-2",
    name: "Beşiktaş Şifa Sağlık Kabini",
    type: "saglik_kabini",
    typeName: "Ruhsatlı Sağlık Kabini",
    city: "İstanbul",
    district: "Beşiktaş",
    address: "Sinanpaşa Mah. Şair Nedim Cad. No:16, Beşiktaş",
    landmark: "Beşiktaş Meydanı & Akaretler Yolu Üzeri",
    phone: "0212 258 11 00",
    is24Hours: true,
    services: ["Tansiyon & Şeker Takibi", "Sonda Değişimi", "Küçük Yanık Tedavisi", "Evde Kan Alma"],
    location: { latitude: 41.0428, longitude: 29.0064 },
  },

  // Ankara - Hastaneler
  {
    id: "ank-h-1",
    name: "Ankara Bilkent Şehir Hastanesi",
    type: "hastane",
    typeName: "Şehir Hastanesi",
    city: "Ankara",
    district: "Çankaya",
    address: "Üniversiteler Mah. 1604. Cad. No:9, Çankaya",
    landmark: "ODTÜ Kampüsü Yanı & Eskişehir Yolu Üzeri",
    phone: "0312 552 60 00",
    emergencyPhone: "112",
    is24Hours: true,
    services: ["7/24 Acil Tıp Kliniği", "Kalp Damar", "Onkoloji", "Kadın Doğum Acil", "Genel Cerrahi"],
    location: { latitude: 39.8972, longitude: 32.7612 },
  },
  {
    id: "ank-h-2",
    name: "Hacettepe Üniversitesi Erişkin Hastanesi",
    type: "hastane",
    typeName: "Üniversite Hastanesi",
    city: "Ankara",
    district: "Altındağ",
    address: "Sıhhiye Yerleşkesi, Altındağ",
    landmark: "Sıhhiye Köprüsü & Kurtuluş Parkı Yanı",
    phone: "0312 305 10 00",
    emergencyPhone: "112",
    is24Hours: true,
    services: ["7/24 Acil Servis", "İleri Tetkik & MR", "Yoğun Bakım", "Kardiyak Acil"],
    location: { latitude: 39.9324, longitude: 32.8621 },
  },
  {
    id: "ank-asm-1",
    name: "Çankaya Kızılay 2 No'lu Aile Sağlığı Merkezi",
    type: "saglik_ocagi",
    typeName: "Aile Sağlığı Merkezi (ASM)",
    city: "Ankara",
    district: "Çankaya",
    address: "Karanfil Sok. No:24, Kızılay, Çankaya",
    landmark: "Kızılay AVM & Yüksel Caddesi Kesişimi",
    phone: "0312 418 33 22",
    is24Hours: false,
    services: ["Aile Hekimi Muayenesi", "Aşı & Bağışıklama", "Tahlil & Rapor", "Kronik Hasta Takibi"],
    location: { latitude: 39.9208, longitude: 32.8541 },
  },
  {
    id: "ank-sk-1",
    name: "Çankaya Tunalı Hilmi Sağlık Kabini",
    type: "saglik_kabini",
    typeName: "Ruhsatlı Sağlık Kabini",
    city: "Ankara",
    district: "Çankaya",
    address: "Tunalı Hilmi Cad. No:78/4, Kavaklıdere, Çankaya",
    landmark: "Kuğulu Park Girişi Civarı",
    phone: "0312 426 10 10",
    is24Hours: true,
    services: ["Reçeteli Enjeksiyon", "Pansuman", "Serum Takma", "Evde Pansuman & Sonda"],
    location: { latitude: 39.9042, longitude: 32.8598 },
  },

  // İzmir - Hastaneler & ASM & Kabin
  {
    id: "izm-h-1",
    name: "İzmir Bayraklı Şehir Hastanesi",
    type: "hastane",
    typeName: "Şehir Hastanesi",
    city: "İzmir",
    district: "Bayraklı",
    address: "Cengizhan Mah. 1620/39 Sok. No:1, Bayraklı",
    landmark: "Çevre Yolu Bayraklı Çıkışı",
    phone: "0232 999 35 35",
    emergencyPhone: "112",
    is24Hours: true,
    services: ["7/24 Travma ve Acil", "Kadın Doğum Acil", "Çocuk Acil", "Tüm Cerrahi Branşlar"],
    location: { latitude: 38.4721, longitude: 27.1854 },
  },
  {
    id: "izm-h-2",
    name: "İzmir Tepecik Eğitim ve Araştırma Hastanesi",
    type: "hastane",
    typeName: "Eğitim ve Araştırma Hastanesi",
    city: "İzmir",
    district: "Konak",
    address: "Gaziler Cad. No:468, Yenişehir, Konak",
    landmark: "Kemer Tren İstasyonu & Hilal Metro Yakını",
    phone: "0232 469 69 69",
    emergencyPhone: "112",
    is24Hours: true,
    services: ["7/24 Acil", "Yoğun Bakım", "Kardiyoloji", "Görüntüleme"],
    location: { latitude: 38.4285, longitude: 27.1685 },
  },
  {
    id: "izm-asm-1",
    name: "Konak Alsancak 1 No'lu Aile Sağlığı Merkezi",
    type: "saglik_ocagi",
    typeName: "Aile Sağlığı Merkezi (ASM)",
    city: "İzmir",
    district: "Konak",
    address: "Kıbrıs Şehitleri Cad. 1448. Sok. No:6, Alsancak",
    landmark: "Gül Sokak Girişi & Alsancak Devlet Hastanesi Yanı",
    phone: "0232 463 22 11",
    is24Hours: false,
    services: ["Muayene", "Kan Tahlili", "Bebek Aşıları", "Reçete Yenileme"],
    location: { latitude: 38.4382, longitude: 27.1425 },
  },
  {
    id: "izm-sk-1",
    name: "Karşıyaka Çarşı Sağlık Kabini & Hemşirelik Hizmetleri",
    type: "saglik_kabini",
    typeName: "Ruhsatlı Sağlık Kabini",
    city: "İzmir",
    district: "Karşıyaka",
    address: "Tuna Mah. Kemalpaşa Cad. No:32/A, Karşıyaka",
    landmark: "Karşıyaka Vapur İskelesi & Çarşı İçi Girişi",
    phone: "0232 368 40 40",
    is24Hours: true,
    services: ["Enjeksiyon", "Serum Uygulaması", "Evde Yara Bakımı", "Dikiş Alma"],
    location: { latitude: 38.4568, longitude: 27.1214 },
  },
];

export function getFacilitiesByCity(
  city: string,
  district?: string,
  facilityType?: FacilityType | "all",
  userLoc?: { latitude: number; longitude: number } | null
): HealthFacility[] {
  let list = SAMPLE_FACILITIES.filter((f) => f.city.toLocaleLowerCase("tr-TR") === city.toLocaleLowerCase("tr-TR"));

  // Filter by district if selected
  if (district && district !== "Tümü") {
    const distLower = district.toLocaleLowerCase("tr-TR");
    const distMatches = list.filter((f) => f.district.toLocaleLowerCase("tr-TR").includes(distLower));
    list = distMatches;
  }

  // Filter by category
  if (facilityType && facilityType !== "all") {
    list = list.filter((f) => f.type === facilityType);
  }

  // Calculate distance if user location is available
  if (userLoc?.latitude && userLoc?.longitude) {
    list = list.map((f) => ({
      ...f,
      distance: calculateDistanceKm(userLoc.latitude, userLoc.longitude, f.location.latitude, f.location.longitude),
    }));
    list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return list;
}
