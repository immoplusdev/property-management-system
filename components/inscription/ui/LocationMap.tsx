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
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ lat: string; lon: string; display_name: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  /* Forward geocode using Nominatim (search address → coordinates) */
  const forwardGeocode = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language=fr&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newLat = +parseFloat(first.lat).toFixed(5);
        const newLng = +parseFloat(first.lon).toFixed(5);
        setCoords({ lat: newLat, lng: newLng });
        onPositionChangeRef.current?.(newLat, newLng);
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([newLat, newLng], 16);
          markerRef.current.setLatLng([newLat, newLng]);
        }
        reverseGeocode(newLat, newLng);
        setSearchInput("");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      /* silent fail */
    } finally {
      setIsSearching(false);
    }
  }, [reverseGeocode]);

  /* Autocomplete: debounced search with suggestions */
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language=fr&limit=8`
      );
      const data = await res.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // Débounce 300ms
  };

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
          background: var(--color-primary); border: 3px solid var(--color-surface);
          box-shadow: 0 4px 14px rgba(39,68,222,0.4), 0 0 0 6px rgba(39,68,222,0.15);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-surface); font-size: 18px; font-weight: 700;
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
          border-top: 10px solid var(--color-primary);
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
      <div className="absolute bottom-3.5 left-3.5 z-1000 bg-white/96 backdrop-blur-[12px] rounded-xl px-4 py-3 shadow-[0_2px_12px_rgba(18,19,26,0.1),0_0_0_1px_rgba(18,19,26,0.04)] max-w-[320px]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-[13px] text-ink">{locationName || "Position sur la carte"}</div>
            {locationSub && <div className="text-[11px] text-ink-3 mt-0.5">{locationSub}</div>}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold tabular-nums text-primary bg-primary/8 px-2.5 py-1 rounded-lg whitespace-nowrap">
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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border-0 bg-white/96 backdrop-blur-[12px] shadow-[0_2px_12px_rgba(18,19,26,0.1),0_0_0_1px_rgba(18,19,26,0.04)] text-[12px] font-semibold text-ink cursor-pointer transition-all duration-150 hover:bg-white hover:text-primary hover:shadow-[0_4px_16px_rgba(39,68,222,0.15),0_0_0_1px_rgba(39,68,222,0.1)]"
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

      {/* Search bar with autocomplete */}
      <div className="absolute top-3.5 left-3.5 z-1000 flex gap-2 w-full max-w-sm flex-col">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Chercher une adresse…"
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                forwardGeocode(searchInput);
              }
            }}
            onFocus={() => searchInput.length >= 2 && setShowSuggestions(true)}
            className="flex-1 px-3.5 py-2 rounded-lg bg-white/96 backdrop-blur-md border border-[rgba(18,19,26,0.1)] text-[12px] font-medium placeholder-ink-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-[0_2px_12px_rgba(18,19,26,0.1)]"
          />
          <button
            type="button"
            onClick={() => forwardGeocode(searchInput)}
            disabled={!searchInput.trim() || isSearching}
            className="px-3.5 py-2 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_2px_12px_rgba(18,19,26,0.1)]"
            title="Chercher l'adresse"
          >
            {isSearching ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10" />
                <path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-white/96 backdrop-blur-md rounded-lg border border-[rgba(18,19,26,0.1)] shadow-[0_4px_20px_rgba(18,19,26,0.15)] overflow-hidden max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => forwardGeocode(suggestion.display_name)}
                className="w-full text-left px-3.5 py-2 text-[11px] hover:bg-primary-50 border-b border-[rgba(18,19,26,0.05)] last:border-b-0 transition-colors"
              >
                <div className="font-semibold text-ink truncate">{suggestion.display_name.split(",")[0]}</div>
                <div className="text-ink-3 text-[10px] truncate">{suggestion.display_name.split(",").slice(1, 3).join(",")}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="absolute top-3.5 right-3.5 z-1000 bg-black/65 backdrop-blur-[8px] text-white text-[11px] font-semibold px-4 py-1.5 rounded-full pointer-events-none opacity-85">
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
