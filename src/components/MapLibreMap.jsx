import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, MapPin, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { BASEMAPS, baseStyle } from "../data/Studies";

export default function MapLibreMap({
  center = [78.9629, 20.5937],
  zoom = 4.5,
  minZoom = 3,
  maxZoom = 18,
  markers = [],
  geojson = null,
  className = "h-80 w-full",
  defaultBase = "satellite",
  interactive = true,
  onMapClick = null,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [base, setBase] = useState(defaultBase);
  const [loaded, setLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseStyle(),
      center,
      zoom,
      minZoom,
      maxZoom,
      interactive,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("load", () => {
      setLoaded(true);

      // Add GeoJSON if provided
      if (geojson) {
        map.addSource("custom-geojson", {
          type: "geojson",
          data: geojson,
        });

        // Polygon fill
        map.addLayer({
          id: "custom-fill",
          type: "fill",
          source: "custom-geojson",
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: {
            "fill-color": "#b8923a",
            "fill-opacity": 0.25,
          },
        });

        // Polygon outline / LineString
        map.addLayer({
          id: "custom-line",
          type: "line",
          source: "custom-geojson",
          filter: ["in", ["geometry-type"], ["literal", ["Polygon", "LineString"]]],
          paint: {
            "line-color": "#ffd166",
            "line-width": 2.5,
          },
        });

        // Points
        map.addLayer({
          id: "custom-pts",
          type: "circle",
          source: "custom-geojson",
          filter: ["==", ["geometry-type"], "Point"],
          paint: {
            "circle-radius": 6,
            "circle-color": "#1f3d2b",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        });
      }
    });

    if (onMapClick) {
      map.on("click", (e) => onMapClick([e.lngLat.lng, e.lngLat.lat]));
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update base layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    Object.keys(BASEMAPS).forEach((k) => {
      if (map.getLayer("base-" + k)) {
        map.setLayoutProperty("base-" + k, "visibility", k === base ? "visible" : "none");
      }
    });
  }, [base, loaded]);

  // Update center & zoom if changed
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !center) return;
    map.flyTo({ center, zoom, duration: 1200, essential: true });
  }, [center?.[0], center?.[1], zoom, loaded]);

  // Update GeoJSON data dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !map.getSource("custom-geojson")) return;
    if (geojson) {
      map.getSource("custom-geojson").setData(geojson);
    }
  }, [geojson, loaded]);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((m) => {
      const el = document.createElement("div");
      el.className = "group relative cursor-pointer";
      el.innerHTML = `
        <div style="background-color: ${m.color || "#1f3d2b"}; border: 2px solid #ffffff; width: 26px; height: 26px; border-radius: 9999px; display: grid; place-items: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
          <div style="width: 8px; height: 8px; border-radius: 9999px; background: #b8923a;"></div>
        </div>
        ${m.title ? `<div style="position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 6px; white-space: nowrap; background: #1f3d2b; color: #f4efe6; font-size: 11px; padding: 2px 8px; border-radius: 4px; pointer-events: none; opacity: 0.95; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">${m.title}</div>` : ""}
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);

      if (m.title || m.description) {
        const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(
          `<div style="font-family: inherit; padding: 4px;">
            <p style="font-weight: 600; font-size: 13px; color: #1f3d2b; margin: 0 0 2px;">${m.title || "Location"}</p>
            ${m.description ? `<p style="font-size: 11px; color: #5c5a4b; margin: 0;">${m.description}</p>` : ""}
          </div>`
        );
        marker.setPopup(popup);
      }

      markersRef.current.push(marker);
    });
  }, [markers, loaded]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-stone-300 bg-stone-100 ${className}`}>
      <div ref={containerRef} className="h-full w-full" />

      {/* Basemap switcher */}
      <div className="absolute left-2.5 top-2.5 z-10 flex gap-1 rounded-lg border border-stone-300/80 bg-[#f4efe6]/95 p-1 shadow-md backdrop-blur">
        {Object.entries(BASEMAPS).map(([k, cfg]) => (
          <button
            key={k}
            type="button"
            onClick={() => setBase(k)}
            className={`rounded px-2 py-1 text-xs font-medium transition ${
              base === k ? "bg-[#1f3d2b] text-white shadow-sm" : "text-stone-700 hover:bg-stone-200/80"
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Modal component for full map views
export function MapModal({
  isOpen,
  onClose,
  title = "Geospatial Map Explorer",
  subtitle = "Interactive MapLibre satellite and cadastral layer viewer",
  center = [78.9629, 20.5937],
  zoom = 5,
  markers = [],
  geojson = null,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#26282b]/70 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="flex h-[85vh] w-full max-w-5xl flex-col rounded-2xl border-t-4 border-[#b8923a] bg-[#faf7f1] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-[#f4efe6] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1f3d2b] text-[#d2b067]"><MapPin size={18} /></span>
            <div>
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#1f3d2b]">{title}</h3>
              <p className="text-xs text-stone-600">{subtitle}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close map" className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200 transition">
            <X size={20} />
          </button>
        </div>

        {/* Map Body */}
        <div className="relative flex-1 p-4">
          <MapLibreMap
            center={center}
            zoom={zoom}
            markers={markers}
            geojson={geojson}
            className="h-full w-full rounded-xl shadow-inner"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-[#f4efe6] px-6 py-3 text-xs text-stone-600">
          <span>MapLibre GL · Free Open Data Tiles · Department of Land Resources</span>
          <button type="button" onClick={onClose} className="rounded-lg bg-[#1f3d2b] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#2a5239]">
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
