import { useSyncExternalStore } from "react";

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const LOCATION_KEY = "nobetci_eczanem_user_location";
const MAX_CACHE_AGE = 5 * 60 * 1000;
let currentLocation: UserLocation | null = null;
let watchId: number | null = null;
const listeners = new Set<() => void>();

function validLocation(value: any): value is UserLocation {
  return Number.isFinite(value?.latitude) && Number.isFinite(value?.longitude) &&
    Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180 &&
    Number.isFinite(value.timestamp) && Date.now() - value.timestamp < MAX_CACHE_AGE;
}

export function getCachedUserLocation(): UserLocation | null {
  if (currentLocation && validLocation(currentLocation)) return currentLocation;
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCATION_KEY) || "null");
    return validLocation(parsed) ? parsed : null;
  } catch { return null; }
}

export function setCachedUserLocation(loc: { latitude: number; longitude: number }) {
  if (!Number.isFinite(loc.latitude) || !Number.isFinite(loc.longitude)) return;
  if (currentLocation &&
      Math.abs(currentLocation.latitude - loc.latitude) < 0.0005 &&
      Math.abs(currentLocation.longitude - loc.longitude) < 0.0005) {
    currentLocation.timestamp = Date.now();
    try { localStorage.setItem(LOCATION_KEY, JSON.stringify(currentLocation)); } catch { /* storage unavailable */ }
    return;
  }
  currentLocation = { latitude: loc.latitude, longitude: loc.longitude, timestamp: Date.now() };
  try { localStorage.setItem(LOCATION_KEY, JSON.stringify(currentLocation)); } catch { /* storage unavailable */ }
  listeners.forEach((listener) => listener());
}

export function startLocationUpdates() {
  if (watchId !== null || !navigator.geolocation) return;
  const cached = getCachedUserLocation();
  if (cached) {
    currentLocation = cached;
    listeners.forEach((listener) => listener());
  }
  watchId = navigator.geolocation.watchPosition(
    (pos) => setCachedUserLocation(pos.coords),
    () => { /* Manual region selection remains usable. */ },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
  );
}

export function useUserLocation(): UserLocation | null {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => currentLocation,
    () => null
  );
}

export function requestAndCacheUserLocation(callback?: (loc: { latitude: number; longitude: number }) => void) {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCachedUserLocation(loc);
      callback?.(loc);
    },
    () => {},
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}
