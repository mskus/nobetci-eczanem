import { useState, useEffect, useCallback } from "react";
import { QuotaData } from "@/components/QuotaBadge";

let globalQuota: QuotaData | null = null;
const listeners: Array<(quota: QuotaData | null) => void> = [];

export function useQuota() {
  const [quota, setQuota] = useState<QuotaData | null>(globalQuota);

  const refreshQuota = useCallback(async () => {
    try {
      const res = await fetch("/api/quota");
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
