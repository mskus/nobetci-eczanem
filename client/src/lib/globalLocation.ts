export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const LOCATION_KEY = "nobetci_eczanem_user_location";

export function getCachedUserLocation(): UserLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setCachedUserLocation(loc: { latitude: number; longitude: number }) {
  try {
    const data: UserLocation = {
      latitude: loc.latitude,
      longitude: loc.longitude,
      timestamp: Date.now(),
    };
    localStorage.setItem(LOCATION_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function requestAndCacheUserLocation(
  callback?: (loc: { latitude: number; longitude: number }) => void
) {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCachedUserLocation(loc);
      if (callback) callback(loc);
    },
    () => {},
    { timeout: 8000, maximumAge: 600000 }
  );
}

export function requestGlobalLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(getCachedUserLocation());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCachedUserLocation(loc);
        resolve(loc);
      },
      () => {
        resolve(getCachedUserLocation());
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 600000 }
    );
  });
}
