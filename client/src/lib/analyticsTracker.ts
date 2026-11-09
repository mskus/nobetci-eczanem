const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const LOCAL_ANALYTICS_KEY = "nobetci_eczanem_local_analytics_v1";

export interface ClientTrackEvent {
  sessionId: string;
  page: string;
  city?: string;
  district?: string;
  deviceType: "mobile" | "desktop" | "tablet";
  browser: string;
  os: string;
  durationSeconds: number;
  timestamp: string;
}

function getDeviceType(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

function getBrowser(): string {
  if (typeof window === "undefined") return "Bilinmiyor";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Browser";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Edge") || ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Diğer";
}

function getOS(): string {
  if (typeof window === "undefined") return "Bilinmiyor";
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Linux")) return "Linux";
  return "Diğer";
}

let activeSessionId = "";
let sessionStartTime = Date.now();
let lastTrackedCity = "";
let lastTrackedDistrict = "";

export function getSessionId(): string {
  if (activeSessionId) return activeSessionId;
  try {
    let sid = sessionStorage.getItem("nobetci_session_id");
    if (!sid) {
      sid = "ses_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
      sessionStorage.setItem("nobetci_session_id", sid);
    }
    activeSessionId = sid;
  } catch {
    activeSessionId = "ses_" + Date.now().toString(36);
  }
  return activeSessionId;
}

export function updateTrackedLocation(city?: string, district?: string) {
  if (city) lastTrackedCity = city;
  if (district && district !== "Tümü") lastTrackedDistrict = district;
}

export function trackPageView(pagePath?: string) {
  if (typeof window === "undefined") return;

  const sessionId = getSessionId();
  const page = pagePath || window.location.hash.replace("#", "") || "/";
  const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));

  const payload: ClientTrackEvent = {
    sessionId,
    page,
    city: lastTrackedCity || undefined,
    district: lastTrackedDistrict || undefined,
    deviceType: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    durationSeconds,
    timestamp: new Date().toISOString(),
  };

  // 1. Save locally for offline / static / admin backup
  try {
    const raw = localStorage.getItem(LOCAL_ANALYTICS_KEY);
    const list: ClientTrackEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(payload);
    localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(list.slice(0, 500)));
  } catch {}

  // 2. Send to backend server
  try {
    fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {}
}

export function initAnalyticsTracking() {
  if (typeof window === "undefined") return;
  getSessionId();
  trackPageView();

  // Periodic heartbeat every 45s to track duration accurately
  setInterval(() => {
    trackPageView();
  }, 45000);
}
