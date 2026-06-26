"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

/* ---------- Leaflet CSS (loaded once) ---------- */
import "leaflet/dist/leaflet.css";

/* ---------- Types ---------- */
interface LocationMapProps {
  lat: number;
  lng: number;
  label?: string;
  subLabel?: string;
  onPositionChange?: (lat: number, lng: number) => void;
}

/* ---------- Inner map (client only) ---------- */
function MapInner({ lat, lng, label, subLabel, onPositionChange }: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ lat, lng });
  const [locationName, setLocationName] = useState(label || "");
  const [locationSub, setLocationSub] = useState(subLabel || "");

  /* Reverse geocode using Nominatim (free, no key) */
  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=fr`
      );
      const data = await res.json();
      if (data?.address) {
        const a = data.address;
        const name = a.suburb || a.neighbourhood || a.city_district || a.town || "";
        const city = a.city || a.town || a.municipality || "";
        setLocationName(name ? `${name}, ${city}` : city);
        setLocationSub(data.display_name?.split(",").slice(0, 3).join(",") || "");
      }
    } catch {
      /* silent fail — coordinates still work */
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const L = require("leaflet");

    /* Fix Leaflet default icon paths in webpack/next.js */
    delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    /* Custom hotel icon */
    const hotelIcon = L.divIcon({
      className: "leaflet-hotel-pin",
      html: `
        <div style="
          width: 44px; height: 44px; border-radius: 50%;
          background: #2744DE; border: 3px solid #fff;
          box-shadow: 0 4px 14px rgba(39,68,222,0.4), 0 0 0 6px rgba(39,68,222,0.15);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 18px; font-weight: 700;
          transform: translate(-22px, -22px);
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21V7l9-4 9 4v14"/>
            <path d="M9 21V13h6v8"/>
          </svg>
        </div>
        <div style="
          position: absolute; top: 44px; left: 50%; transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 8px solid transparent; border-right: 8px solid transparent;
          border-top: 10px solid #2744DE;
          filter: drop-shadow(0 2px 4px rgba(39,68,222,0.3));
        "></div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
    });

    /* Zoom control top-right */
    L.control.zoom({ position: "topright" }).addTo(map);

    /* OpenStreetMap tiles (free, no key) */
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    /* Draggable marker */
    const marker = L.marker([lat, lng], {
      icon: hotelIcon,
      draggable: true,
    }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      setCoords({ lat: +pos.lat.toFixed(5), lng: +pos.lng.toFixed(5) });
      onPositionChange?.(+pos.lat.toFixed(5), +pos.lng.toFixed(5));
      reverseGeocode(pos.lat, pos.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    /* Initial reverse geocode */
    reverseGeocode(lat, lng);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Recenter when props change */
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
      markerRef.current.setLatLng([lat, lng]);
      setCoords({ lat, lng });
    }
  }, [lat, lng]);

  const handleRecenter = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = +pos.coords.latitude.toFixed(5);
          const newLng = +pos.coords.longitude.toFixed(5);
          setCoords({ lat: newLat, lng: newLng });
          onPositionChange?.(newLat, newLng);
          if (mapRef.current && markerRef.current) {
            mapRef.current.setView([newLat, newLng], 16);
            markerRef.current.setLatLng([newLat, newLng]);
          }
          reverseGeocode(newLat, newLng);
        },
        () => alert("Impossible d'obtenir votre position. Vérifiez les permissions du navigateur."),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="location-map-wrapper">
      <div ref={containerRef} className="location-map-container" />

      {/* Floating info card */}
      <div className="location-map-info">
        <div className="location-map-info-row">
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
              {locationName || "Position sur la carte"}
            </div>
            {locationSub && (
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                {locationSub}
              </div>
            )}
          </div>
          <div className="location-map-coords">
            <span>{coords.lat.toFixed(3)}° N</span>
            <span style={{ color: "var(--text-4)" }}>,</span>
            <span>{Math.abs(coords.lng).toFixed(3)}° W</span>
          </div>
        </div>
      </div>

      {/* Floating action buttons */}
      <div className="location-map-actions">
        <button
          type="button"
          className="location-map-btn"
          onClick={handleRecenter}
          title="Utiliser ma position GPS"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
          Ma position
        </button>
      </div>

      {/* Hint */}
      <div className="location-map-hint">
        Glissez le pin pour repositionner
      </div>
    </div>
  );
}

/* ---------- Dynamic export (no SSR) ---------- */
const LocationMap = dynamic(() => Promise.resolve(MapInner), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 320, borderRadius: 16, background: "var(--bg-2)",
      display: "grid", placeItems: "center", color: "var(--text-3)", fontSize: 13,
    }}>
      Chargement de la carte…
    </div>
  ),
}) as React.ComponentType<LocationMapProps>;

export { LocationMap };
export type { LocationMapProps };
