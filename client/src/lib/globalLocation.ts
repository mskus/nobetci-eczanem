export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const LOCATION_KEY = "nobetci_eczanem_user_location";
let inMemoryLocation: UserLocation | null = null;
let inFlightPromise: Promise<{ latitude: number; longitude: number } | null> | null = null;

export function getCachedUserLocation(): UserLocation | null {
  if (inMemoryLocation) {
    return inMemoryLocation;
  }
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LOCATION_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
      inMemoryLocation = parsed;
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
    inMemoryLocation = data;
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(data));
    }
  } catch {
    // ignore
  }
}

export function requestAndCacheUserLocation(
  callback?: (loc: { latitude: number; longitude: number }) => void
) {
  requestGlobalLocation().then((loc) => {
    if (loc && callback) {
      callback(loc);
    }
  });
}

/**
 * Robust, mobile-safe GPS location requester.
 * Prevents multiple concurrent browser prompts, handles rapid page switching,
 * returns in-memory/localStorage cache immediately if fresh, and falls back cleanly.
 */
export function requestGlobalLocation(
  forceFresh = false
): Promise<{ latitude: number; longitude: number } | null> {
  const cached = getCachedUserLocation();

  // If we already have a recent cached location (less than 15 minutes old) and forceFresh isn't requested, return it immediately
  if (!forceFresh && cached && Date.now() - cached.timestamp < 15 * 60 * 1000) {
    return Promise.resolve({ latitude: cached.latitude, longitude: cached.longitude });
  }

  // If a location request is already in progress, reuse the existing promise to avoid browser errors
  if (inFlightPromise) {
    return inFlightPromise;
  }

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(cached ? { latitude: cached.latitude, longitude: cached.longitude } : null);
  }

  inFlightPromise = new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
    let resolved = false;

    const safeResolve = (loc: { latitude: number; longitude: number } | null) => {
      if (resolved) return;
      resolved = true;
      inFlightPromise = null;
      if (loc) {
        setCachedUserLocation(loc);
      }
      resolve(loc);
    };

    // Hard fallback timeout: if browser GPS is stuck, resolve with cached location after 6 seconds
    const timer = setTimeout(() => {
      safeResolve(cached ? { latitude: cached.latitude, longitude: cached.longitude } : null);
    }, 6000);

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          safeResolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // If first attempt fails (e.g. high accuracy timeout), try quick low-accuracy fallback
          try {
            navigator.geolocation.getCurrentPosition(
              (lowPos) => {
                clearTimeout(timer);
                safeResolve({
                  latitude: lowPos.coords.latitude,
                  longitude: lowPos.coords.longitude,
                });
              },
              () => {
                clearTimeout(timer);
                safeResolve(cached ? { latitude: cached.latitude, longitude: cached.longitude } : null);
              },
              { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 }
            );
          } catch {
            clearTimeout(timer);
            safeResolve(cached ? { latitude: cached.latitude, longitude: cached.longitude } : null);
          }
        },
        { enableHighAccuracy: false, timeout: 4500, maximumAge: 300000 }
      );
    } catch {
      clearTimeout(timer);
      safeResolve(cached ? { latitude: cached.latitude, longitude: cached.longitude } : null);
    }
  });

  return inFlightPromise;
}
