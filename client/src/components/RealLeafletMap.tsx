import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatDistance, calculateDistanceKm } from "@/lib/turkeyGeoData";
import { useLanguage } from "@/lib/i18n";

export interface PharmacyLocation {
  latitude: number | null;
  longitude: number | null;
}

export interface RawPharmacy {
  id: string;
  name: string;
  address: string | null;
  phone: string;
  phone2?: string | null;
  location?: PharmacyLocation;
  city?: { name: string; slug: string };
  district?: { name: string; slug: string };
  duty?: { date: string; isVerified: boolean };
  distance?: number;
}

interface RealLeafletMapProps {
  pharmacies: RawPharmacy[];
  selectedPharmacy: number;
  onSelect: (index: number) => void;
  areaTitle: string;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function RealLeafletMap({
  pharmacies,
  selectedPharmacy,
  onSelect,
  userLocation,
}: RealLeafletMapProps) {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const prevPharmaciesSigRef = useRef<string>("");

  // Initialize map & attach ResizeObserver so container never clips or shifts center
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (!mapInstanceRef.current) {
      const map = L.map(container, {
        center: [39.9208, 32.8541],
        zoom: 6,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const resizeObserver = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    resizeObserver.observe(container);

    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 60);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 250);
    const t3 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
    };
  }, []);

  // Update user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation?.latitude && userLocation?.longitude) {
      const userIconHtml = `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; width: 24px; height: 24px; background: rgba(37, 99, 235, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: userIconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const uMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      uMarker.bindPopup(`
        <div style="padding: 4px; font-weight: bold; color: #1d4ed8; font-size: 12px;">
          📍 ${t.yourLocationPopup}
        </div>
      `);

      userMarkerRef.current = uMarker;
    }
  }, [userLocation, t.yourLocationPopup]);

  // Update markers and bounds when pharmacies or selectedPharmacy change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);
    let validCoordsCount = 0;

    // Check if userLocation is in the same region (<= 85 km from first valid pharmacy)
    const firstValid = pharmacies.find(
      (p) => p.location?.latitude && p.location?.longitude
    );
    if (
      userLocation?.latitude &&
      userLocation?.longitude &&
      firstValid?.location?.latitude &&
      firstValid?.location?.longitude
    ) {
      const distToUser = calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        firstValid.location.latitude,
        firstValid.location.longitude
      );
      if (distToUser <= 85) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
        validCoordsCount++;
      }
    }

    pharmacies.forEach((pharmacy, index) => {
      const lat = pharmacy.location?.latitude;
      const lng = pharmacy.location?.longitude;
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      validCoordsCount++;
      const isSelected = index === selectedPharmacy;

      // Custom numbered red medical pin matching card #index+1
      const iconHtml = `
        <div style="
          width: ${isSelected ? "36px" : "30px"};
          height: ${isSelected ? "36px" : "30px"};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${isSelected ? "#991b1b" : "#dc2626"};
          border: 2.5px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-weight: 900;
            font-size: ${isSelected ? "13px" : "11px"};
            line-height: 1;
          ">${index + 1}</span>
        </div>
      `;

      const size = isSelected ? 36 : 30;
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: iconHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 800 : 100,
      }).addTo(map);

      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const distanceBadge =
        pharmacy.distance !== undefined
          ? `<div style="display: inline-block; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 800; margin-bottom: 4px;">📍 ${formatDistance(pharmacy.distance)}</div>`
          : "";

      const popupHtml = `
        <div style="font-family: inherit; padding: 4px; min-width: 175px;">
          <div style="color: #dc2626; font-size: 10px; font-weight: 800; text-transform: uppercase;">#${index + 1} · ${t.dutyPharmacyBadge}</div>
          <div style="font-size: 13px; font-weight: 800; color: #111; margin: 2px 0;">${pharmacy.name}</div>
          ${distanceBadge}
          <div style="font-size: 11px; color: #555; margin-bottom: 6px; line-height: 1.3;">${pharmacy.address || pharmacy.district?.name || ""}</div>
          <div style="display: flex; gap: 6px;">
            <a href="tel:${pharmacy.phone.replace(/[^0-9+]/g, "")}" style="display: inline-block; background: #fdebec; color: #dc2626; padding: 4px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; text-decoration: none;">${t.callBtn}</a>
            <a href="${mapsUrl}" target="_blank" rel="noreferrer" style="display: inline-block; background: #dc2626; color: #fff; padding: 4px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; text-decoration: none;">${t.directionsBtn}</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        onSelect(index);
      });

      bounds.extend([lat, lng]);
      markersRef.current.push(marker);
    });

    const currentSig = pharmacies.map((p) => p.id || p.name).join("|");
    const listChanged = currentSig !== prevPharmaciesSigRef.current;
    prevPharmaciesSigRef.current = currentSig;

    if (listChanged) {
      if (validCoordsCount > 0 && bounds.isValid()) {
        map.invalidateSize();
        map.fitBounds(bounds, {
          padding: [28, 28],
          maxZoom: 14,
        });
      }
    } else {
      const p = pharmacies[selectedPharmacy];
      if (p?.location?.latitude && p?.location?.longitude) {
        map.setView([p.location.latitude, p.location.longitude], Math.max(map.getZoom(), 14), {
          animate: true,
        });
        const marker = markersRef.current[selectedPharmacy];
        if (marker) {
          marker.openPopup();
        }
      }
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, [pharmacies, selectedPharmacy, onSelect, userLocation, t]);

  return (
    <div
      className="map-preview w-full h-full relative"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-label="Nöbetçi eczane harita görünümü"
    >
      <div
        ref={mapContainerRef}
        className="map-canvas w-full h-full relative z-0"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}

