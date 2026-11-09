import { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const LOCAL_ADSENSE_KEY = "nobetci_adsense_settings_v1";

export interface AdSenseConfigClient {
  adsenseEnabled: boolean;
  publisherId: string;
  autoAdsEnabled: boolean;
  headerScripts: string;
  bodyScripts: string;
  slots: {
    topBanner: { enabled: boolean; slotId: string };
    inlineList: { enabled: boolean; slotId: string };
    mobileSticky: { enabled: boolean; slotId: string };
    sidebarRail: { enabled: boolean; slotId: string };
  };
}

const DEFAULT_CONFIG: AdSenseConfigClient = {
  adsenseEnabled: false,
  publisherId: "",
  autoAdsEnabled: false,
  headerScripts: "",
  bodyScripts: "",
  slots: {
    topBanner: { enabled: true, slotId: "" },
    inlineList: { enabled: true, slotId: "" },
    mobileSticky: { enabled: true, slotId: "" },
    sidebarRail: { enabled: true, slotId: "" },
  },
};

let cachedConfig: AdSenseConfigClient = (() => {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(LOCAL_ADSENSE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return DEFAULT_CONFIG;
})();

const listeners: Array<(cfg: AdSenseConfigClient) => void> = [];

export function getAdSenseConfigClient(): AdSenseConfigClient {
  return cachedConfig;
}

export function saveAdSenseConfigClient(newCfg: AdSenseConfigClient) {
  cachedConfig = newCfg;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_ADSENSE_KEY, JSON.stringify(newCfg));
    }
  } catch {}
  applyAdSenseScripts(newCfg);
  listeners.forEach((l) => l(newCfg));
}

export function applyAdSenseScripts(cfg: AdSenseConfigClient) {
  if (typeof window === "undefined") return;

  // 1. Google AdSense Script Injection
  const existingScript = document.getElementById("google-adsense-script");
  if (cfg.adsenseEnabled && cfg.publisherId && cfg.publisherId.trim()) {
    const cleanPubId = cfg.publisherId.trim();
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-adsense-script";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cleanPubId}`;
      document.head.appendChild(script);
    }
  } else if (existingScript) {
    existingScript.remove();
  }

  // 2. Custom Header Scripts Injection
  let customHeader = document.getElementById("custom-header-scripts-container");
  if (cfg.headerScripts && cfg.headerScripts.trim()) {
    if (!customHeader) {
      customHeader = document.createElement("div");
      customHeader.id = "custom-header-scripts-container";
      document.head.appendChild(customHeader);
    }
    customHeader.innerHTML = cfg.headerScripts;
  } else if (customHeader) {
    customHeader.remove();
  }
}

export function useAdSense() {
  const [config, setConfig] = useState<AdSenseConfigClient>(cachedConfig);

  useEffect(() => {
    listeners.push(setConfig);

    // Fetch from server
    fetch(`${API_BASE_URL}/api/adsense/public`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.success && json.data) {
          cachedConfig = json.data;
          try {
            localStorage.setItem(LOCAL_ADSENSE_KEY, JSON.stringify(json.data));
          } catch {}
          setConfig(json.data);
          applyAdSenseScripts(json.data);
        }
      })
      .catch(() => {});

    applyAdSenseScripts(cachedConfig);

    return () => {
      const idx = listeners.indexOf(setConfig);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return config;
}
