import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

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
}

export function RealLeafletMap({
  pharmacies,
  selectedPharmacy,
  onSelect,
  areaTitle,
}: RealLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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
      // Keep map instance alive across quick re-renders, or cleanup on unmount
    };
  }, []);

  // Update markers and bounds when pharmacies change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);
    let validCoordsCount = 0;

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
          background: ${isSelected ? "#b51218" : "#d71920"};
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
      const popupHtml = `
        <div style="font-family: inherit; padding: 4px; min-width: 170px;">
          <div style="color: #d71920; font-size: 10px; font-weight: 800; text-transform: uppercase;">Nöbetçi Eczane</div>
          <div style="font-size: 14px; font-weight: 800; color: #111; margin: 2px 0;">${pharmacy.name}</div>
          <div style="font-size: 11px; color: #666; margin-bottom: 6px;">${pharmacy.address || pharmacy.district?.name || ""}</div>
          <div style="display: flex; gap: 8px;">
            <a href="tel:${pharmacy.phone.replace(/[^0-9+]/g, "")}" style="display: inline-block; background: #fdebec; color: #d71920; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-decoration: none;">Ara</a>
            <a href="${mapsUrl}" target="_blank" rel="noreferrer" style="display: inline-block; background: #d71920; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-decoration: none;">Yol Tarifi</a>
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
        padding: [40, 40],
        maxZoom: 15,
      });
    }

    // Leaflet needs invalidateSize after rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [pharmacies, selectedPharmacy, onSelect]);

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
        <span className="map-status">
          <span className="status-dot" /> {pharmacies.length} nöbetçi
        </span>
      </div>
      <div
        ref={mapContainerRef}
        className="map-canvas w-full h-[523px] relative z-0"
        style={{ minHeight: "450px" }}
      />
    </div>
  );
}
