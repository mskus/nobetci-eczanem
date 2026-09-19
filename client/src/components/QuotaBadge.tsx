import { useState } from "react";
import { Zap, Activity, Info, X, ShieldAlert, CheckCircle2, History } from "lucide-react";

export interface QuotaData {
  limit: number;
  used: number;
  remaining: number;
  savedByCache: number;
  cacheHitRate: string;
  period: string;
  lastRequestAt: string | null;
  history?: Array<{
    timestamp: string;
    endpoint: string;
    query: string;
    fromCache: boolean;
    count?: number;
  }>;
}

export function QuotaBadge({ quota, lastWasCache }: { quota: QuotaData | null; lastWasCache?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!quota) return null;

  const percentageUsed = Math.min(100, Math.round((quota.used / quota.limit) * 100));
  const isLow = quota.remaining <= 20;

  return (
    <>
      {/* Interactive Quota Status Pill */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-sm hover:shadow ${
            isLow
              ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
          }`}
          title="API Kota ve Tasarruf Detaylarını Görüntüle"
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${isLow ? "bg-amber-500" : "bg-emerald-500"}`} />
          <span>
            API Kotası: <strong>{quota.remaining}</strong> / {quota.limit} Kalan
          </span>
          {quota.savedByCache > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
              <Zap size={12} className="text-amber-500 fill-amber-500" />
              {quota.savedByCache} tasarruf
            </span>
          )}
          <Info size={14} className="opacity-70 ml-0.5" />
        </button>

        {lastWasCache !== undefined && (
          <span
            className={`hidden md:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-bold ${
              lastWasCache
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {lastWasCache ? (
              <>
                <Zap size={13} className="text-blue-600 fill-blue-600" />
                Önbellekten Sunuldu (0 Kota)
              </>
            ) : (
              <>
                <Activity size={13} className="text-amber-600" />
                Canlı API Sorgusu (1 Kota)
              </>
            )}
          </span>
        )}
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <Activity size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 leading-tight">API Kotası & Akıllı Önbellek</h3>
                  <p className="text-xs text-gray-500">Aylık 200 Sorgu Kotasını Koruma Sistemi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="py-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Quota Progress Bar */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center text-sm font-bold mb-2">
                  <span className="text-gray-700">Aylık Kota Durumu ({quota.period})</span>
                  <span className={isLow ? "text-amber-600 font-extrabold" : "text-emerald-700"}>
                    {quota.remaining} / {quota.limit} Kalan
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percentageUsed > 85 ? "bg-red-500" : percentageUsed > 60 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${percentageUsed}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                  <span>Kullanılan: {quota.used} sorgu</span>
                  <span>{percentageUsed}% tüketildi</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mb-1">
                    <Zap size={14} className="text-emerald-600 fill-emerald-600" />
                    Kurtarılan İstekler
                  </div>
                  <div className="text-2xl font-black text-emerald-900">{quota.savedByCache}</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Akıllı önbellek ile korundu</div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-blue-800 font-bold mb-1">
                    <CheckCircle2 size={14} className="text-blue-600" />
                    Önbellek Verimliliği
                  </div>
                  <div className="text-2xl font-black text-blue-900">{quota.cacheHitRate}</div>
                  <div className="text-[11px] text-blue-700 mt-0.5 font-medium">Tasarruf oranı</div>
                </div>
              </div>

              {/* Optimization Rules Notice */}
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3.5 text-xs text-amber-950 space-y-2 font-medium leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                  <ShieldAlert size={16} className="text-amber-700" />
                  Kota Tasarruf Mimarisi
                </div>
                <ul className="list-disc pl-4 space-y-1 text-gray-700">
                  <li>
                    <strong>Şehir Düzeyinde Toplu Çekim:</strong> Bir il sorgulandığında tüm ilçeler ve 3 gün (dün, bugün, yarın) tek sorguyla çekilir.
                  </li>
                  <li>
                    <strong>Statik İl ve İlçeler:</strong> Türkiye'nin 81 ili ve tüm ilçeleri sisteme gömülüdür; arama kutuları 0 kota harcar.
                  </li>
                  <li>
                    <strong>09:00 Nöbet Değişimi TTL:</strong> Eczane nöbetleri sabah 09:00'a kadar geçerlidir. Ertesi sabaha kadar aynı şehir için 0 ek sorgu yapılır.
                  </li>
                  <li>
                    <strong>Kalıcı Önbellek:</strong> Sunucu yeniden başlasa dahi önbelleğe alınan şehir verileri diske yazılarak saklanır.
                  </li>
                </ul>
              </div>

              {/* Recent queries history */}
              {quota.history && quota.history.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2">
                    <History size={14} />
                    Son İstek Kayıtları
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                    {quota.history.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 text-[11px]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.fromCache ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.fromCache ? "Önbellek" : "API"}
                          </span>
                          <span className="font-mono text-gray-600 truncate">{item.query}</span>
                        </div>
                        <span className="text-gray-400 shrink-0 ml-2">
                          {new Date(item.timestamp).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
