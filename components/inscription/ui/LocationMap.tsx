"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type * as L from "leaflet";

/* ---------- Leaflet CSS (loaded once) — third-party stylesheet (section 5.3) ---------- */
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

  // Always hold the latest callback — avoids stale closure in the Leaflet dragend listener
  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;

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
    if (mapRef.current) return;
    let cancelled = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

    /* Fix Leaflet default icon paths in webpack/next.js */
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
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
      onPositionChangeRef.current?.(+pos.lat.toFixed(5), +pos.lng.toFixed(5));
      reverseGeocode(pos.lat, pos.lng);
    });

      mapRef.current = map;
      markerRef.current = marker;

      /* Initial reverse geocode */
      reverseGeocode(lat, lng);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
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
          onPositionChangeRef.current?.(newLat, newLng);
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
    <div className="relative rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(10,10,15,0.06),0_4px_20px_rgba(10,10,15,0.08)]">
      <div ref={containerRef} className="location-map-container h-80 w-full z-0" />

      {/* Floating info card */}
      <div className="absolute bottom-3.5 left-3.5 z-1000 bg-white/96 backdrop-blur-[12px] rounded-xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] max-w-[320px]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-[13px] text-ink">{locationName || "Position sur la carte"}</div>
            {locationSub && <div className="text-[11px] text-ink-3 mt-0.5">{locationSub}</div>}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold tabular-nums text-primary bg-[rgba(39,68,222,0.08)] px-2.5 py-1 rounded-lg whitespace-nowrap">
            <span>{coords.lat.toFixed(3)}° N</span>
            <span className="text-ink-4">,</span>
            <span>{Math.abs(coords.lng).toFixed(3)}° W</span>
          </div>
        </div>
      </div>

      {/* Floating action buttons */}
      <div className="absolute bottom-3.5 right-3.5 z-1000 flex gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border-0 bg-white/96 backdrop-blur-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] text-[12px] font-semibold text-ink cursor-pointer transition-all duration-150 hover:bg-white hover:text-primary hover:shadow-[0_4px_16px_rgba(39,68,222,0.15),0_0_0_1px_rgba(39,68,222,0.1)]"
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
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-1000 bg-black/65 backdrop-blur-[8px] text-white text-[11px] font-semibold px-4 py-1.5 rounded-full pointer-events-none opacity-85">
        Glissez le pin pour repositionner
      </div>
    </div>
  );
}

/* ---------- Dynamic export (no SSR) ---------- */
const LocationMap = dynamic(() => Promise.resolve(MapInner), {
  ssr: false,
  loading: () => (
    <div className="h-80 rounded-2xl bg-surface-2 grid place-items-center text-ink-3 text-[13px]">
      Chargement de la carte…
    </div>
  ),
}) as React.ComponentType<LocationMapProps>;

export { LocationMap };
export type { LocationMapProps };
