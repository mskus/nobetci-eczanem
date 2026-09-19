import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { formatDistance } from "@/lib/turkeyGeoData";

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
  areaTitle,
  userLocation,
}: RealLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [39.0, 35.0], // Turkey center
        zoom: 6,
        scrollWheelZoom: true,
      });

      // OpenStreetMap standard tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map instance alive across quick re-renders
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
          📍 Sizin Konumunuz
        </div>
      `);

      userMarkerRef.current = uMarker;
    }
  }, [userLocation]);

  // Update markers and bounds when pharmacies change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);
    let validCoordsCount = 0;

    if (userLocation?.latitude && userLocation?.longitude) {
      bounds.extend([userLocation.latitude, userLocation.longitude]);
      validCoordsCount++;
    }

    pharmacies.forEach((pharmacy, index) => {
      const lat = pharmacy.location?.latitude;
      const lng = pharmacy.location?.longitude;
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      validCoordsCount++;
      const isSelected = index === selectedPharmacy;

      // Custom red medical cross pin
      const iconHtml = `
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${isSelected ? "#991b1b" : "#dc2626"};
          border: 3px solid #ffffff;
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
            font-size: 17px;
            line-height: 1;
          ">+</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const distanceBadge = pharmacy.distance !== undefined
        ? `<div style="display: inline-block; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 800; margin-bottom: 4px;">📍 ${formatDistance(pharmacy.distance)}</div>`
        : "";

      const popupHtml = `
        <div style="font-family: inherit; padding: 4px; min-width: 170px;">
          <div style="color: #dc2626; font-size: 10px; font-weight: 800; text-transform: uppercase;">Nöbetçi Eczane</div>
          <div style="font-size: 14px; font-weight: 800; color: #111; margin: 2px 0;">${pharmacy.name}</div>
          ${distanceBadge}
          <div style="font-size: 11px; color: #666; margin-bottom: 6px;">${pharmacy.address || pharmacy.district?.name || ""}</div>
          <div style="display: flex; gap: 8px;">
            <a href="tel:${pharmacy.phone.replace(/[^0-9+]/g, "")}" style="display: inline-block; background: #fdebec; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-decoration: none;">Ara</a>
            <a href="${mapsUrl}" target="_blank" rel="noreferrer" style="display: inline-block; background: #dc2626; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-decoration: none;">Yol Tarifi</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        onSelect(index);
      });

      if (isSelected) {
        marker.openPopup();
      }

      bounds.extend([lat, lng]);
      markersRef.current.push(marker);
    });

    if (validCoordsCount > 0) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 15,
      });
    }

    // Leaflet needs invalidateSize after rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [pharmacies, selectedPharmacy, onSelect, userLocation]);

  // When selectedPharmacy changes, center and open popup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const p = pharmacies[selectedPharmacy];
    if (p?.location?.latitude && p?.location?.longitude) {
      map.setView([p.location.latitude, p.location.longitude], 15, {
        animate: true,
      });
      const marker = markersRef.current[selectedPharmacy];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedPharmacy, pharmacies]);

  return (
    <div className="map-preview" aria-label="Nöbetçi eczane harita görünümü">
      <div className="map-topbar">
        <span className="map-title">
          <MapPin size={18} /> {areaTitle}
        </span>
        <div className="flex items-center gap-2">
          {userLocation && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              📍 Konumunuz Aktif
            </span>
          )}
          <span className="map-status">
            <span className="status-dot" /> {pharmacies.length} nöbetçi
          </span>
        </div>
      </div>
      <div
        ref={mapContainerRef}
        className="map-canvas w-full h-[523px] relative z-0"
        style={{ minHeight: "450px" }}
      />
    </div>
  );
}
