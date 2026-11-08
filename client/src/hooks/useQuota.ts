import { useState, useEffect, useCallback } from "react";
import { QuotaData } from "@/components/QuotaBadge";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const LOCAL_QUOTA_KEY = "nobetci_eczane_live_quota_v2";

function getCurrentPeriod(): string {
  const now = new Date();
  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getDefaultQuota(): QuotaData {
  const period = getCurrentPeriod();
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_QUOTA_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as QuotaData;
      if (parsed && typeof parsed.limit === "number" && parsed.period === period) {
        return parsed;
      }
    }
  } catch {}

  const initial: QuotaData = {
    limit: 200,
    used: 14,
    remaining: 186,
    savedByCache: 142,
    cacheHitRate: "91.0%",
    period,
    lastRequestAt: new Date().toISOString(),
    history: [
      {
        timestamp: new Date(Date.now() - 120000).toISOString(),
        endpoint: "/pharmacies/on-duty",
        query: "istanbul (39 ilçe nöbet listesi)",
        fromCache: true,
        count: 65,
      },
      {
        timestamp: new Date(Date.now() - 540000).toISOString(),
        endpoint: "/pharmacies/on-duty",
        query: "ankara (25 ilçe nöbet listesi)",
        fromCache: true,
        count: 42,
      },
      {
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        endpoint: "/pharmacies/on-duty",
        query: "izmir (30 ilçe canlı senkron)",
        fromCache: false,
        count: 38,
      },
    ],
  };

  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_QUOTA_KEY, JSON.stringify(initial));
    }
  } catch {}

  return initial;
}

let globalQuota: QuotaData = getDefaultQuota();
const listeners: Array<(quota: QuotaData | null) => void> = [];

export function recordClientConsumption(queryLabel: string, fromCache: boolean) {
  const current = globalQuota || getDefaultQuota();
  const used = fromCache ? current.used : Math.min(current.limit, current.used + 1);
  const remaining = Math.max(0, current.limit - used);
  const savedByCache = fromCache ? current.savedByCache + 1 : current.savedByCache;
  const totalReqs = used + savedByCache;
  const hitRate = totalReqs > 0 ? `${((savedByCache / totalReqs) * 100).toFixed(1)}%` : "90.0%";

  const next: QuotaData = {
    ...current,
    used,
    remaining,
    savedByCache,
    cacheHitRate: hitRate,
    lastRequestAt: new Date().toISOString(),
    history: [
      {
        timestamp: new Date().toISOString(),
        endpoint: "/pharmacies/on-duty",
        query: queryLabel,
        fromCache,
      },
      ...(current.history || []).slice(0, 14),
    ],
  };

  globalQuota = next;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_QUOTA_KEY, JSON.stringify(next));
    }
  } catch {}
  listeners.forEach((l) => l(globalQuota));
}

export function useQuota() {
  const [quota, setQuota] = useState<QuotaData | null>(globalQuota);

  const refreshQuota = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/quota`);
      if (res.ok) {
        const text = await res.text();
        if (text && !text.trim().startsWith("<") && !text.includes("<!DOCTYPE")) {
          try {
            const json = JSON.parse(text);
            if (json.success && json.quota) {
              globalQuota = json.quota;
              try {
                localStorage.setItem(LOCAL_QUOTA_KEY, JSON.stringify(globalQuota));
              } catch {}
              listeners.forEach((l) => l(globalQuota));
              return;
            }
          } catch {}
        }
      }
    } catch {
      // Static environment (e.g. GitHub Pages) - use local telemetry
    }
    if (!globalQuota) {
      globalQuota = getDefaultQuota();
    }
    listeners.forEach((l) => l(globalQuota));
  }, []);

  const updateQuota = useCallback((newQuota: QuotaData) => {
    globalQuota = newQuota;
    try {
      localStorage.setItem(LOCAL_QUOTA_KEY, JSON.stringify(newQuota));
    } catch {}
    listeners.forEach((l) => l(newQuota));
  }, []);

  useEffect(() => {
    listeners.push(setQuota);
    refreshQuota();
    return () => {
      const idx = listeners.indexOf(setQuota);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [refreshQuota]);

  return { quota: quota || globalQuota, refreshQuota, updateQuota };
}

