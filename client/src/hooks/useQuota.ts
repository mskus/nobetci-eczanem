import { useState, useEffect, useCallback } from "react";
import { QuotaData } from "@/components/QuotaBadge";

let globalQuota: QuotaData | null = null;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const listeners: Array<(quota: QuotaData | null) => void> = [];

export function useQuota() {
  const [quota, setQuota] = useState<QuotaData | null>(globalQuota);

  const refreshQuota = useCallback(async () => {
    if (!API_BASE_URL && (window.location.hostname !== "localhost" || window.location.port !== "3000")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/quota`);
      if (res.ok) {
        const text = await res.text();
        if (text && !text.trim().startsWith("<") && !text.includes("<!DOCTYPE")) {
          try {
            const json = JSON.parse(text);
            if (json.success && json.quota) {
              globalQuota = json.quota;
              listeners.forEach((l) => l(globalQuota));
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Failed to fetch quota:", err);
    }
  }, []);

  const updateQuota = useCallback((newQuota: QuotaData) => {
    globalQuota = newQuota;
    listeners.forEach((l) => l(newQuota));
  }, []);

  useEffect(() => {
    listeners.push(setQuota);
    if (!globalQuota) {
      refreshQuota();
    }
    return () => {
      const idx = listeners.indexOf(setQuota);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [refreshQuota]);

  return { quota, refreshQuota, updateQuota };
}
