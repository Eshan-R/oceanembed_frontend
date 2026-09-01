import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

// Fix Leaflet's broken default icon paths when bundled with Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)[
  "_getIconUrl"
];
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

import {
  REGION,
  VARIABLE_META,
  rampColor,
  round,
  surfaceValue,
  type SurfaceVariable,
} from "@/lib/ocean";

/* ── SST / SSH / Currents heatmap drawn onto a Leaflet canvas overlay ── */

const GRID_STEP = 1.25; // degrees per cell (matches SVG version)

function buildHeatmapCanvas(
  variable: SurfaceVariable,
  date: string,
): HTMLCanvasElement {
  const meta = VARIABLE_META[variable];
  const cols = Math.round((REGION.lonMax - REGION.lonMin) / GRID_STEP);
  const rows = Math.round((REGION.latMax - REGION.latMin) / GRID_STEP);

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d")!;

  for (let row = 0; row < rows; row++) {
    // canvas row 0 = top = highest latitude
    const lat = REGION.latMax - row * GRID_STEP - GRID_STEP / 2;
    for (let col = 0; col < cols; col++) {
      const lon = REGION.lonMin + col * GRID_STEP + GRID_STEP / 2;
      const v = surfaceValue(lat, lon, date, variable);
      const t = (v - meta.min) / (meta.max - meta.min);
      ctx.fillStyle = rampColor(t);
      ctx.fillRect(col, row, 1, 1);
    }
  }
  return canvas;
}

/** Re-draws a semi-transparent heatmap image overlay whenever props change. */
function HeatmapOverlay({
  variable,
  date,
}: {
  variable: SurfaceVariable;
  date: string;
}) {
  const overlayRef = useRef<L.ImageOverlay | null>(null);

  // Remove old overlay and add new one whenever variable/date change
  useEffect(() => {
    const map = overlayRef.current?.['_map'] as L.Map | undefined ?? null;

    const canvas = buildHeatmapCanvas(variable, date);
    const dataUrl = canvas.toDataURL("image/png");

    const bounds: L.LatLngBoundsExpression = [
      [REGION.latMin, REGION.lonMin],
      [REGION.latMax, REGION.lonMax],
    ];

    if (overlayRef.current) {
      overlayRef.current.setUrl(dataUrl);
    } else {
      // We need the map instance — use a hack-free approach via useMap hook below
    }

    return () => {
      overlayRef.current?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variable, date]);

  return null;
}

/** Inner component that has access to the map instance via hook. */
function MapInterior({
  variable,
  date,
  selected,
  onSelect,
}: {
  variable: SurfaceVariable;
  date: string;
  selected: { lat: number; lon: number };
  onSelect: (lat: number, lon: number) => void;
}) {
  // Track the current heatmap overlay
  const overlayRef = useRef<L.ImageOverlay | null>(null);

  const map = useMapEvents({
    click(e) {
      const lat = round(e.latlng.lat, 2);
      const lon = round(e.latlng.lng, 2);
      // Clamp to region
      if (
        lat >= REGION.latMin && lat <= REGION.latMax &&
        lon >= REGION.lonMin && lon <= REGION.lonMax
      ) {
        onSelect(lat, lon);
      }
    },
  });

  // Redraw heatmap when variable or date changes
  useEffect(() => {
    const canvas = buildHeatmapCanvas(variable, date);
    const dataUrl = canvas.toDataURL("image/png");

    const bounds: L.LatLngBoundsExpression = [
      [REGION.latMin, REGION.lonMin],
      [REGION.latMax, REGION.lonMax],
    ];

    if (overlayRef.current) {
      overlayRef.current.setUrl(dataUrl);
    } else {
      const overlay = L.imageOverlay(dataUrl, bounds, { opacity: 0.55 });
      overlay.addTo(map);
      overlayRef.current = overlay;
    }

    return () => {
      overlayRef.current?.remove();
      overlayRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variable, date, map]);

  return (
    <Marker position={[selected.lat, selected.lon]} />
  );
}

/* ── Public component ── */

interface OceanMapClientProps {
  date: string;
  variable: SurfaceVariable;
  selected: { lat: number; lon: number };
  onSelect: (lat: number, lon: number) => void;
}

export default function OceanMapClient({
  date,
  variable,
  selected,
  onSelect,
}: OceanMapClientProps) {
  const center: L.LatLngExpression = [17.5, 75]; // centre of the NIO domain

  return (
    <MapContainer
      center={center}
      zoom={5}
      minZoom={4}
      maxZoom={8}
      maxBounds={[
        [REGION.latMin - 3, REGION.lonMin - 3],
        [REGION.latMax + 3, REGION.lonMax + 3],
      ]}
      style={{ height: "100%", width: "100%" }}
    >
      {/* ESRI World Imagery — free satellite tiles, no API key required */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, USGS, USDA, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        maxZoom={19}
      />

      {/* ESRI Reference overlay — country/city labels + coastlines, free, no key */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
        opacity={0.85}
        zIndex={10}
      />

      <MapInterior
        variable={variable}
        date={date}
        selected={selected}
        onSelect={onSelect}
      />
    </MapContainer>
  );
}