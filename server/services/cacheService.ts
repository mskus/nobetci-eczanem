import fs from "fs";
import path from "path";

export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  cachedAt: string;
  expiresAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), "server", "data");
const CACHE_FILE = path.join(DATA_DIR, "cache.json");

let memoryCache: Map<string, CacheEntry> = new Map();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadCacheFromDisk() {
  ensureDataDir();
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as Record<string, CacheEntry>;
      const now = new Date();
      memoryCache.clear();
      for (const [key, entry] of Object.entries(raw)) {
        if (new Date(entry.expiresAt) > now) {
          memoryCache.set(key, entry);
        }
      }
    } catch (err) {
      console.error("Failed to read cache file:", err);
    }
  }
}

function saveCacheToDisk() {
  ensureDataDir();
  try {
    const obj: Record<string, CacheEntry> = {};
    memoryCache.forEach((entry, key) => {
      obj[key] = entry;
    });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write cache file:", err);
  }
}

// Initial disk load
loadCacheFromDisk();

/**
 * Calculates the next 09:00 AM Turkey time (UTC+3, which is 06:00 UTC).
 */
export function getNextDutyChangeTime(): string {
  const now = new Date();
  const next = new Date(now);

  // 06:00 UTC = 09:00 Istanbul time (UTC+3)
  next.setUTCHours(6, 0, 0, 0);

  if (now >= next) {
    next.setUTCDate(next.getUTCDate() + 1);
  }

  return next.toISOString();
}

export function getCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  const now = new Date();
  if (new Date(entry.expiresAt) <= now) {
    memoryCache.delete(key);
    saveCacheToDisk();
    return null;
  }

  return entry.data as T;
}

export function setCache<T>(key: string, data: T, expiresAt?: string): void {
  const expiry = expiresAt || getNextDutyChangeTime();
  const entry: CacheEntry<T> = {
    key,
    data,
    cachedAt: new Date().toISOString(),
    expiresAt: expiry,
  };
  memoryCache.set(key, entry);
  saveCacheToDisk();
}

export function getAllCachedKeys(): string[] {
  return Array.from(memoryCache.keys());
}

export function clearCache(): void {
  memoryCache.clear();
  saveCacheToDisk();
}
