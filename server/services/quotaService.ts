import fs from "fs";
import path from "path";

export interface QuotaState {
  limit: number;
  used: number;
  remaining: number;
  savedByCache: number;
  period: string; // e.g. "2026-09"
  lastRequestAt: string | null;
  history: Array<{
    timestamp: string;
    endpoint: string;
    query: string;
    fromCache: boolean;
    count?: number;
  }>;
}

const DATA_DIR = path.resolve(process.cwd(), "server", "runtime");
const QUOTA_FILE = path.join(DATA_DIR, "quota.json");
const MONTHLY_LIMIT = 200;

function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

let cachedQuota: QuotaState | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadQuotaState(): QuotaState {
  if (cachedQuota && cachedQuota.period === getCurrentPeriod()) return cachedQuota;
  if (cachedQuota) {
    cachedQuota.period = getCurrentPeriod();
    cachedQuota.used = 0;
    cachedQuota.remaining = cachedQuota.limit;
    cachedQuota.savedByCache = 0;
    cachedQuota.history = [];
    cachedQuota.lastRequestAt = null;
    saveQuotaState(cachedQuota);
    return cachedQuota;
  }

  ensureDataDir();
  const currentPeriod = getCurrentPeriod();

  if (fs.existsSync(QUOTA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(QUOTA_FILE, "utf-8")) as QuotaState;
      // Reset if new month
      if (data.period !== currentPeriod) {
        data.period = currentPeriod;
        data.used = 0;
        data.remaining = data.limit || MONTHLY_LIMIT;
        data.savedByCache = 0;
        data.history = [];
        saveQuotaState(data);
      }
      cachedQuota = data;
      return cachedQuota;
    } catch {
      // file corrupted or unreadable, initialize
    }
  }

  const initial: QuotaState = {
    limit: MONTHLY_LIMIT,
    used: 0,
    remaining: MONTHLY_LIMIT,
    savedByCache: 0,
    period: currentPeriod,
    lastRequestAt: null,
    history: [],
  };

  saveQuotaState(initial);
  cachedQuota = initial;
  return initial;
}

export function saveQuotaState(state: QuotaState) {
  ensureDataDir();
  cachedQuota = state;
  try {
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save quota state:", err);
  }
}

export function recordExternalRequest(endpoint: string, query: string, count?: number): QuotaState {
  const state = loadQuotaState();
  state.used += 1;
  state.remaining = Math.max(0, state.limit - state.used);
  state.lastRequestAt = new Date().toISOString();
  state.history.unshift({
    timestamp: new Date().toISOString(),
    endpoint,
    query,
    fromCache: false,
    count,
  });
  if (state.history.length > 50) {
    state.history = state.history.slice(0, 50);
  }
  saveQuotaState(state);
  return state;
}

export function recordCacheHit(endpoint: string, query: string, count?: number): QuotaState {
  const state = loadQuotaState();
  state.savedByCache += 1;
  state.history.unshift({
    timestamp: new Date().toISOString(),
    endpoint,
    query,
    fromCache: true,
    count,
  });
  if (state.history.length > 50) {
    state.history = state.history.slice(0, 50);
  }
  saveQuotaState(state);
  return state;
}

export function getQuotaSummary() {
  const state = loadQuotaState();
  const totalRequests = state.used + state.savedByCache;
  const cacheHitRate = totalRequests > 0 ? `${Math.round((state.savedByCache / totalRequests) * 100)}%` : "0%";

  return {
    limit: state.limit,
    used: state.used,
    remaining: state.remaining,
    savedByCache: state.savedByCache,
    cacheHitRate,
    period: state.period,
    lastRequestAt: state.lastRequestAt,
    history: state.history.slice(0, 15),
  };
}
