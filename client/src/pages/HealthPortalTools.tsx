import React, { useState, useMemo } from "react";
import {
  Activity,
  Wind,
  ShieldAlert,
  Calculator,
  Flame,
  HeartPulse,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Search,
  ChevronRight,
  Info,
  Sparkles,
  ExternalLink,
  MapPin,
  FileText,
  Clock,
  Pill,
} from "lucide-react";
import { getCityAirQuality } from "@/lib/airQualityService";
import { TITCK_ALERTS, TitckAlert } from "@/lib/titckAlertsData";
import {
  COMMON_MEDICATIONS_FOODS,
  DRUG_INTERACTION_RULES,
  checkInteraction,
} from "@/lib/drugInteractionsData";
import {
  BLOOD_COMPATIBILITY_DATA,
  MAJOR_KIZILAY_CENTERS,
} from "@/lib/kizilayBloodData";
import { getLocalCities } from "@/lib/pharmacyService";
import { toast } from "sonner";

type TabKey = "sgk-hesaplayici" | "hava-polen" | "titck-bildirim" | "etkilesim" | "kan-bagisi" | "ilk-yardim";

export default function HealthPortalTools() {
  const [activeTab, setActiveTab] = useState<TabKey>("sgk-hesaplayici");

  // SGK Calculator States
  const [patientType, setPatientType] = useState<"calisan" | "emekli" | "yesilkart">("calisan");
  const [hospitalType, setHospitalType] = useState<number>(6); // 6 TL devlet
  const [boxCount, setBoxCount] = useState<number>(3);
  const [totalDrugPrice, setTotalDrugPrice] = useState<number>(350);
  const [equivalentDifference, setEquivalentDifference] = useState<number>(25);

  // Air Quality & Pollen States
  const [selectedCityAQI, setSelectedCityAQI] = useState<string>("İstanbul");
  const currentAQI = useMemo(() => getCityAirQuality(selectedCityAQI), [selectedCityAQI]);

  // TITCK Alerts States
  const [titckSearch, setTitckSearch] = useState<string>("");
  const [titckFilter, setTitckFilter] = useState<string>("all");

  const filteredTitckAlerts = useMemo(() => {
    return TITCK_ALERTS.filter((item) => {
      const matchText =
        item.drugName.toLowerCase().includes(titckSearch.toLowerCase()) ||
        item.activeIngredient.toLowerCase().includes(titckSearch.toLowerCase()) ||
        item.barcode.includes(titckSearch) ||
        item.affectedBatches.some((b) => b.toLowerCase().includes(titckSearch.toLowerCase()));

      if (titckFilter === "all") return matchText;
      if (titckFilter === "class1") return matchText && item.recallClassLevel === 1;
      if (titckFilter === "class2") return matchText && item.recallClassLevel === 2;
      if (titckFilter === "class3") return matchText && item.recallClassLevel === 3;
      if (titckFilter === "fake") return matchText && item.recallClassLevel === 4;
      return matchText;
    });
  }, [titckSearch, titckFilter]);

  // Drug Interaction States
  const [item1, setItem1] = useState<string>("Parasetamol (Parol, Minoset vb.)");
  const [item2, setItem2] = useState<string>("Alkol");
  const interactionResult = useMemo(() => checkInteraction(item1, item2), [item1, item2]);

  // Blood Donation States
  const [selectedBloodType, setSelectedBloodType] = useState<string>("A Rh (+)");
  const currentBloodInfo = useMemo(
    () => BLOOD_COMPATIBILITY_DATA.find((b) => b.type === selectedBloodType) || BLOOD_COMPATIBILITY_DATA[0],
    [selectedBloodType]
  );

  // Calculate SGK Total
  const sgkCalculation = useMemo(() => {
    // Katkı payı yüzdesi
    const percent = patientType === "calisan" ? 0.20 : patientType === "emekli" ? 0.10 : 0.0;
    const drugContribution = totalDrugPrice * percent;
    
    // Reçete harcı (1-3 kutu: 3 TL, sonraki her kutu +1 TL)
    let prescriptionFee = 0;
    if (patientType !== "yesilkart") {
      prescriptionFee = boxCount <= 3 ? 3 : 3 + (boxCount - 3) * 1;
    }

    const examFee = patientType === "yesilkart" ? 0 : hospitalType;
    const totalToPay = drugContribution + examFee + prescriptionFee + equivalentDifference;

    return {
      percent: percent * 100,
      drugContribution,
      prescriptionFee,
      examFee,
      equivalentDifference,
      totalToPay,
    };
  }, [patientType, hospitalType, boxCount, totalDrugPrice, equivalentDifference]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white pt-10 pb-8 px-4 sm:px-6 shadow-md border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                T.C. Sağlık Bakanlığı, SGK MEDULA & DSÖ Entegre Sağlık Portalı
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Sağlık & Eczane Araçları Portalı
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 mt-1 max-w-2xl">
                SGK reçete katkı payı hesaplama, anlık hava & polen kalitesi, TİTCK ilaç geri çekme uyarıları, ilaç etkileşim testi ve Kızılay kan bağışı rehberi.
              </p>
            </div>

            {/* Quick Emergency Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="tel:112"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-all transform active:scale-95"
              >
                <Phone className="w-4 h-4 animate-pulse" />
                112 Acil Yardım
              </a>
              <a
                href="tel:114"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-900/30 transition-all transform active:scale-95"
              >
                <AlertTriangle className="w-4 h-4" />
                114 UZEM Zehir Danışma
              </a>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-emerald-600/40">
            <button
              onClick={() => setActiveTab("sgk-hesaplayici")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === "sgk-hesaplayici"
                  ? "bg-white text-emerald-900 shadow-md font-bold"
                  : "text-emerald-100 hover:bg-emerald-700/50"
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              SGK Katkı Payı & Eşdeğer Farkı
            </button>
            <button
              onClick={() => setActiveTab("hava-polen")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === "hava-polen"
                  ? "bg-white text-emerald-900 shadow-md font-bold"
                  : "text-emerald-100 hover:bg-emerald-700/50"
              }`}
            >
              <Wind className="w-4 h-4 text-cyan-600" />
              Polen & Hava Kalitesi İndeksi
            </button>
            <button
              onClick={() => setActiveTab("titck-bildirim")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === "titck-bildirim"
                  ? "bg-white text-emerald-900 shadow-md font-bold"
                  : "text-emerald-100 hover:bg-emerald-700/50"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              TİTCK İlaç Geri Çekme & Güvenlik
            </button>
            <button
              onClick={() => setActiveTab("etkilesim")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === "etkilesim"
                  ? "bg-white text-emerald-900 shadow-md font-bold"
                  : "text-emerald-100 hover:bg-emerald-700/50"
              }`}
            >
              <Pill className="w-4 h-4 text-indigo-600" />
              İlaç & Besin Etkileşim Kontrolü
            </button>
            <button
              onClick={() => setActiveTab("kan-bagisi")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === "kan-bagisi"
                  ? "bg-white text-emerald-900 shadow-md font-bold"
                  : "text-emerald-100 hover:bg-emerald-700/50"
              }`}
            >
              <Droplets className="w-4 h-4 text-red-600" />
              Kızılay Kan Bağışı & Kan Grupları
            </button>
            <button
              onClick={() => setActiveTab("ilk-yardim")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === "ilk-yardim"
                  ? "bg-white text-emerald-900 shadow-md font-bold"
                  : "text-emerald-100 hover:bg-emerald-700/50"
              }`}
            >
              <HeartPulse className="w-4 h-4 text-rose-600" />
              7/24 Acil İlk Yardım Kılavuzu
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* ========================================================================= */}
        {/* TAB 1: SGK KATKI PAYI HESAPLAYICI */}
        {/* ========================================================================= */}
        {activeTab === "sgk-hesaplayici" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      SGK Reçete & Eşdeğer İlaç Farkı Hesaplama
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      2024–2026 SGK Sağlık Uygulama Tebliği (SUT) ve MEDULA resmi kurallarıyla tam uyumlu
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {/* 1. Sigortalı Durumu */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      1. Sigortalı Statüsü
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPatientType("calisan")}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          patientType === "calisan"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-sm font-semibold">Çalışan (%20)</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">SSK, Bağkur, Memur</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPatientType("emekli")}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          patientType === "emekli"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-sm font-semibold">Emekli (%10)</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Maaştan Kesilir</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPatientType("yesilkart")}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          patientType === "yesilkart"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-sm font-semibold">Muaf / Yeşil Kart (%0)</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">65 Yaş, Harp Malulü</div>
                      </button>
                    </div>
                  </div>

                  {/* 2. Muayene Edilen Sağlık Kuruluşu */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      2. Muayene Edilen Sağlık Tesisi
                    </label>
                    <select
                      value={hospitalType}
                      onChange={(e) => setHospitalType(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value={0}>Aile Sağlığı Merkezi (Sağlık Ocağı) — 0 ₺ Muayene Payı</option>
                      <option value={6}>Devlet Hastanesi (2. Basamak) — 6.00 ₺ Katılım Payı</option>
                      <option value={7}>Eğitim ve Araştırma Hastanesi — 7.00 ₺ Katılım Payı</option>
                      <option value={8}>Şehir Hastanesi / Üniversite Hastanesi — 8.00 ₺ Katılım Payı</option>
                      <option value={15}>Özel Hastane (SGK Anlaşmalı) — 15.00 ₺ Katılım Payı</option>
                    </select>
                  </div>

                  {/* 3. Reçetedeki Toplam İlaç Bedeli (PSF) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Reçetedeki İlaçların PSF Tutarı (₺)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={totalDrugPrice}
                          onChange={(e) => setTotalDrugPrice(Math.max(0, Number(e.target.value)))}
                          className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-sm font-bold text-slate-400">₺</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Reçetedeki Toplam Kutu Sayısı
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={boxCount}
                        onChange={(e) => setBoxCount(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* 4. Eşdeğer İlaç Taban Fiyat Farkı */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Eşdeğer (Muadil) Taban Fiyat Farkı (Opsiyonel)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={equivalentDifference}
                        onChange={(e) => setEquivalentDifference(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-sm font-bold text-slate-400">₺</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      * SGK, aynı etken maddeye sahip en ucuz eşdeğer ilacın %5 fazlasını öder. Orijinal veya daha pahalı muadil tercih edilirse aradaki fark hasta tarafından ödenir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SGK Results Receipt Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">MEDULA Fiş Özeti</span>
                    <h3 className="text-lg font-bold text-white">Eczane Tahsilat Pusulası</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    {patientType === "calisan" ? "Çalışan" : patientType === "emekli" ? "Emekli" : "Muaf"}
                  </span>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Reçete İlaç Katkı Payı (%{sgkCalculation.percent}):</span>
                    <span className="font-semibold text-white">
                      {sgkCalculation.drugContribution.toFixed(2)} ₺
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>Hastane Muayene Katılım Payı:</span>
                    <span className="font-semibold text-white">
                      {sgkCalculation.examFee.toFixed(2)} ₺
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>Reçete Sabit Katılım Harcı ({boxCount} Kutu):</span>
                    <span className="font-semibold text-white">
                      {sgkCalculation.prescriptionFee.toFixed(2)} ₺
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>SGK Eşdeğer İlaç Fiyat Farkı:</span>
                    <span className="font-semibold text-amber-300">
                      {sgkCalculation.equivalentDifference.toFixed(2)} ₺
                    </span>
                  </div>

                  <div className="border-t border-slate-800 pt-4 mt-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs text-slate-400">Eczanede Ödenecek Tutar:</div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                          {sgkCalculation.totalToPay.toFixed(2)} ₺
                        </div>
                      </div>
                      {patientType === "emekli" && (
                        <div className="text-right text-[11px] text-emerald-300/80 max-w-[140px]">
                          * Emeklilerin muayene & ilaç katkı payları maaşlarından tahsil edilir.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">💡 Eczacı Tavsiyesi:</strong>
                  Reçetenizdeki ilaçların yerine eşdeğer (biyo-eşdeğer) yerli jenerik ilaçları tercih ederek eşdeğer fiyat farkını <strong>0.00 ₺</strong>'ye düşürebilirsiniz.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: POLEN & HAVA KALİTESİ İNDEKSİ */}
        {/* ========================================================================= */}
        {activeTab === "hava-polen" && (
          <div className="space-y-6">
            {/* City Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Şehir Seçimi & Hava Kalitesi Raporu</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Astım, Alerjik Rinit ve KOAH hastaları için canlı çevresel risk göstergesi</p>
                </div>
              </div>

              <div className="w-full sm:w-64">
                <select
                  value={selectedCityAQI}
                  onChange={(e) => setSelectedCityAQI(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  {getLocalCities().map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.plateCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* AQI Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* AQI Main Gauge Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hava Kalitesi İndeksi (AQI)</span>
                    <span className="text-xs text-slate-400">{currentAQI.lastUpdated}</span>
                  </div>
                  <div className="flex items-baseline gap-3 my-2">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">{currentAQI.aqi}</span>
                    <span className="text-xs font-semibold text-slate-500">US AQI Standardı</span>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm ${currentAQI.statusColor}`}>
                      {currentAQI.status}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentAQI.healthAdvice}
                </div>
              </div>

              {/* Pollen Gauge Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Polen Yoğunluk Seviyesi</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      currentAQI.pollenLevel === "Çok Yüksek"
                        ? "bg-purple-100 text-purple-700 border border-purple-300"
                        : currentAQI.pollenLevel === "Yüksek"
                        ? "bg-amber-100 text-amber-700 border border-amber-300"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    }`}>
                      {currentAQI.pollenLevel}
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        <span>Ağaç Poleni (Huş, Meşe, Çam)</span>
                        <span className="text-amber-600 font-bold">{currentAQI.pollenTypes.tree}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            currentAQI.pollenTypes.tree === "Yüksek" ? "w-4/5 bg-amber-500" : "w-2/5 bg-emerald-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        <span>Çim Poleni (Gramineae)</span>
                        <span className="text-cyan-600 font-bold">{currentAQI.pollenTypes.grass}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            currentAQI.pollenTypes.grass === "Yüksek" ? "w-3/4 bg-cyan-500" : "w-1/3 bg-emerald-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        <span>Yabani Ot Poleni (Pelin Otu)</span>
                        <span className="text-emerald-600 font-bold">{currentAQI.pollenTypes.weed}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-1/4 bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  Alerji hastalarının sabah 05:00 - 10:00 saatleri arasında evlerini havalandırmaktan kaçınması önerilir.
                </div>
              </div>

              {/* Patient Group Risk Analysis */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-4">
                    Klinik Hasta Risk Tablosu
                  </span>

                  <div className="space-y-3.5">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Astım & KOAH</div>
                        <div className="text-xs text-slate-500">Bronkospazm Riski</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        currentAQI.asthmaRisk === "Kritik"
                          ? "bg-red-600 text-white"
                          : currentAQI.asthmaRisk === "Yüksek"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-600 text-white"
                      }`}>
                        {currentAQI.asthmaRisk} Risk
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Alerjik Rinit & Konjonktivit</div>
                        <div className="text-xs text-slate-500">Hapşırma & Göz Kaşıntısı</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        currentAQI.allergyRisk === "Kritik"
                          ? "bg-purple-600 text-white"
                          : currentAQI.allergyRisk === "Yüksek"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-600 text-white"
                      }`}>
                        {currentAQI.allergyRisk} Risk
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>PM2.5: <strong>{currentAQI.pm25} µg/m³</strong></span>
                  <span>PM10: <strong>{currentAQI.pm10} µg/m³</strong></span>
                  <span>Ozon (O₃): <strong>{currentAQI.o3} µg/m³</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TİTCK İLAÇ GERİ ÇEKME & GÜVENLİK */}
        {/* ========================================================================= */}
        {activeTab === "titck-bildirim" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    TİTCK & TEB Resmi İlaç Geri Çekme ve Güvenlik Bültenleri
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sağlık Bakanlığı 1. ve 2. sınıf geri çekme kararları, karekodsuz sahte ilaç uyarıları ve parti takibi
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setTitckFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      titckFilter === "all"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Tümü ({TITCK_ALERTS.length})
                  </button>
                  <button
                    onClick={() => setTitckFilter("class2")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      titckFilter === "class2"
                        ? "bg-amber-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    2. Sınıf Risk
                  </button>
                  <button
                    onClick={() => setTitckFilter("fake")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      titckFilter === "fake"
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Sahte/Kaçak Uyarısı
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="İlaç adı, etken madde, barkod veya parti numarası ile sorgula..."
                  value={titckSearch}
                  onChange={(e) => setTitckSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Alerts List */}
              <div className="space-y-4">
                {filteredTitckAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-white dark:hover:bg-slate-800/80 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                              alert.recallClassLevel === 1 || alert.recallClassLevel === 4
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : alert.recallClassLevel === 2
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-blue-100 text-blue-700 border border-blue-300"
                            }`}
                          >
                            {alert.recallClass}
                          </span>
                          <span className="text-xs text-slate-400">Yayım: {alert.officialAnnouncementDate}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {alert.drugName}
                        </h4>
                      </div>

                      <div className="text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        Barkod: <strong>{alert.barcode}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300 mb-3">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Etken Madde:</span>{" "}
                        {alert.activeIngredient} ({alert.manufacturer})
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Etkilenen Partiler:</span>{" "}
                        <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                          {alert.affectedBatches.join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 mb-2">
                      <strong>Gerekçe:</strong> {alert.reason}
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200">
                      <strong>Hasta & Eczane Aksiyonu:</strong> {alert.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: İLAÇ & BESİN ETKİLEŞİM KONTROLÜ */}
        {/* ========================================================================= */}
        {activeTab === "etkilesim" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    İlaç-İlaç ve İlaç-Besin Etkileşim Kontrol Motoru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Birlikte alındığında tehlike oluşturabilecek ilaç, alkol, greyfurt ve süt kombinasyonlarını test ediniz
                  </p>
                </div>
              </div>

              {/* Selector Pair */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    1. İlaç veya Besin Maddesi
                  </label>
                  <select
                    value={item1}
                    onChange={(e) => setItem1(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {COMMON_MEDICATIONS_FOODS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    2. İlaç veya Besin Maddesi
                  </label>
                  <select
                    value={item2}
                    onChange={(e) => setItem2(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {COMMON_MEDICATIONS_FOODS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interaction Result Card */}
              {interactionResult ? (
                <div
                  className={`p-6 rounded-2xl border ${
                    interactionResult.severityLevel === 1
                      ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800/80"
                      : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle
                      className={`w-6 h-6 ${
                        interactionResult.severityLevel === 1 ? "text-red-600" : "text-amber-600"
                      }`}
                    />
                    <div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                          interactionResult.severityLevel === 1
                            ? "bg-red-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {interactionResult.severity}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {interactionResult.category}: {item1} + {item2}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm mt-4">
                    <div className="text-slate-800 dark:text-slate-200">
                      <strong>Klinik Etki:</strong> {interactionResult.clinicalEffect}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 text-xs">
                      <strong>Biyokimyasal Mekanizma:</strong> {interactionResult.mechanism}
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 mt-2 font-medium">
                      <strong>💡 Klinik Eczacı Tavsiyesi:</strong> {interactionResult.recommendation}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                      Kritik Bir Etkileşim Bildirilmedi
                    </h4>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-400 mt-0.5">
                      Seçilen iki madde arasında doğrudan hayatı tehdit eden bilinen bir majör etkileşim kaydı bulunamadı. Reçeteli tüm tedavilerinizde doktorunuza ve eczacınıza danışmayı unutmayınız.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: KIZILAY KAN BAĞIŞI & KAN GRUPLARI */}
        {/* ========================================================================= */}
        {activeTab === "kan-bagisi" && (
          <div className="space-y-6">
            {/* Blood Type Compatibility Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Kan Grubu Uyumluluk & Bağış Matrisi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kimden kan alabilir, kime kan verebilirsiniz? Türkiye nüfus oranları ve acil durum rehberi
                  </p>
                </div>
              </div>

              {/* Type Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mb-6">
                {BLOOD_COMPATIBILITY_DATA.map((b) => (
                  <button
                    key={b.type}
                    onClick={() => setSelectedBloodType(b.type)}
                    className={`py-2.5 px-2 rounded-xl text-center border font-bold text-sm transition-all ${
                      selectedBloodType === b.type
                        ? "bg-red-600 text-white border-red-600 shadow-md transform scale-105"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-50"
                    }`}
                  >
                    {b.type}
                  </button>
                ))}
              </div>

              {/* Selected Type Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500">Kan Grubu</span>
                  <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-0.5">{currentBloodInfo.type}</div>
                  <div className="text-xs text-slate-500 mt-1">Türkiye Oranı: <strong>{currentBloodInfo.rarityPercent}</strong></div>
                </div>

                <div>
                  <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">Kan Verebileceği Gruplar</span>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {currentBloodInfo.canGiveTo.join(", ")}
                  </div>
                </div>

                <div>
                  <span className="text-xs uppercase font-bold text-cyan-600 dark:text-cyan-400">Kan Alabileceği Gruplar</span>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {currentBloodInfo.canReceiveFrom.join(", ")}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-600 dark:text-slate-400 italic">
                ℹ️ {currentBloodInfo.notes}
              </div>
            </div>

            {/* Major Kızılay Blood Centers */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Türkiye Kızılay Bölge Kan Merkezleri & Canlı Bağış Noktaları
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MAJOR_KIZILAY_CENTERS.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-red-600 mb-1">
                        <span>{c.city} / {c.district}</span>
                        <span className="text-[11px] text-slate-500">{c.workingHours}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{c.address}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-750 flex items-center justify-between">
                      <a
                        href={`tel:${c.phone}`}
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:text-red-600"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {c.phone}
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Haritada Aç
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: 7/24 ACİL İLK YARDIM VE ZEHİRLENME REHBERİ */}
        {/* ========================================================================= */}
        {activeTab === "ilk-yardim" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Heimlich */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Tam Tıkanma & Heimlich Manevrası</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                  1. Hastanın arkasına geçin ve sarılın.<br />
                  2. Bir elinizi yumruk yaparak başparmak içeri bakacak şekilde göbek deliğinin hemen üstüne yerleştirin.<br />
                  3. Diğer elinizle yumruğunuzu kavrayıp kuvvetle <strong>içeri ve yukarı doğru</strong> 5 kez bastırın.<br />
                  4. Cisim çıkana veya 112 gelene kadar devam edin.
                </p>
              </div>

              {/* Card 2: Yanık */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Akut Yanık İlk Müdahalesi</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. Yanık bölgesini derhal en az <strong>15–20 dakika çeşme suyu (ılık/soğuk su)</strong> altında tutun.<br />
                  2. <strong>Asla buz, diş macunu, yoğurt veya salça sürmeyiniz.</strong><br />
                  3. Oluşan su kabarcıklarını patlatmayın.<br />
                  4. Temiz, nemli bir bezle örtüp en yakın acil servise başvurun.
                </p>
              </div>

              {/* Card 3: Kalp Krizi */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Kalp Krizi Şüphesi & İlk Adımlar</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. Göğüste baskı, sol kola, sırta veya çeneye vuran ağrıda <strong>derhal 112'yi arayın</strong>.<br />
                  2. Hastayı yarı oturur pozisyona getirin, sıkan giysileri gevşetin.<br />
                  3. Bilinen bir alerjisi yoksa bir adet <strong>300 mg Aspirin</strong> çiğnetin.<br />
                  4. Hastayı yürütmeyin veya efor sarf ettirmeyin.
                </p>
              </div>

              {/* Card 4: Zehirlenme UZEM */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                    4
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Kimyasal / İlaç Zehirlenmesi (114 UZEM)</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. Çamaşır suyu, asit veya ilaç içen kişiyi <strong>asla kusturmaya çalışmayın</strong>.<br />
                  2. Yoğurt veya tuzlu su içirmeyin.<br />
                  3. İlaç ambalajını veya kimyasal şişesini yanınıza alarak <strong>114 UZEM</strong>'i arayın.<br />
                  4. En hızlı şekilde acil servise nakil sağlayın.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
