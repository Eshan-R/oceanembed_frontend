<<<<<<< HEAD
import React, { useEffect, useState } from 'react';

// Define the props that map.tsx is passing down
interface OceanMapProps {
  date: string;
  variable: string;
  selected: { lat: number; lon: number };
  onSelect: (lat: number, lon: number) => void;
}

export default function OceanMap(props: OceanMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ElementType | null>(null);

  useEffect(() => {
    // Strictly load in the browser to prevent SSR crashes
    import('./OceanMapClient').then((module) => {
      setMapComponent(() => module.default);
    });
  }, []);

  if (!MapComponent) {
    return (
      <div className="w-full h-[500px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
        <span className="text-slate-500 font-medium animate-pulse">Initializing map layers...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapComponent {...props} />
    </div>
  );
}
=======
import { useMemo } from "react";

import {
  REGION,
  VARIABLE_META,
  rampColor,
  round,
  surfaceValue,
  type SurfaceVariable,
} from "@/lib/ocean";

const STEP = 1.25;

const LAND_PATHS: { d: string; label?: string }[] = [
  // Very rough schematic coastlines (lon/lat space), for orientation only.
  {
    d: "M45,30 L45,22 L52,20 L57,22.5 L60,25 L58,28 L56,30 Z",
    label: "Arabia",
  },
  {
    d: "M60,30 L66,30 L68,26 L72,22 L77,13 L80,15 L82,17 L85,20 L87,22 L89,22 L92,25 L96,26 L100,30 L60,30 Z",
    label: "India",
  },
  { d: "M79.5,9.8 L81.9,8.9 L81.5,6.2 L79.9,6.5 Z" },
  { d: "M92,20 L98,17 L100,12 L105,12 L105,30 L100,30 Z", label: "SE Asia" },
  { d: "M45,12 L52,12 L52,5 L45,5 Z", label: "Africa" },
];

export function OceanMap({
  date,
  variable,
  selected,
  onSelect,
}: {
  date: string;
  variable: SurfaceVariable;
  selected: { lat: number; lon: number };
  onSelect: (lat: number, lon: number) => void;
}) {
  const meta = VARIABLE_META[variable];
  const cells = useMemo(() => {
    const out: { lat: number; lon: number; v: number }[] = [];
    for (let lat = REGION.latMin; lat < REGION.latMax; lat += STEP) {
      for (let lon = REGION.lonMin; lon < REGION.lonMax; lon += STEP) {
        out.push({
          lat: round(lat + STEP / 2, 3),
          lon: round(lon + STEP / 2, 3),
          v: surfaceValue(lat + STEP / 2, lon + STEP / 2, date, variable),
        });
      }
    }
    return out;
  }, [date, variable]);

  const norm = (v: number) => (v - meta.min) / (meta.max - meta.min);
  const x = (lon: number) => lon;
  const y = (lat: number) => REGION.latMax + REGION.latMin - lat;

  return (
    <div className="panel overflow-hidden">
      <svg
        viewBox={`${REGION.lonMin} ${REGION.latMin} ${REGION.lonMax - REGION.lonMin} ${REGION.latMax - REGION.latMin}`}
        className="block h-auto w-full bg-secondary"
        role="img"
        aria-label={`${meta.label} map of the North Indian Ocean`}
      >
        {cells.map((c) => (
          <rect
            key={`${c.lat}-${c.lon}`}
            x={x(c.lon) - STEP / 2}
            y={y(c.lat) - STEP / 2}
            width={STEP}
            height={STEP}
            fill={rampColor(norm(c.v))}
            className="cursor-pointer"
            onClick={() => onSelect(c.lat, c.lon)}
          >
            <title>{`${c.lat.toFixed(2)}°N, ${c.lon.toFixed(2)}°E — ${round(c.v, 2)} ${meta.unit}`}</title>
          </rect>
        ))}

        {variable === "currents" &&
          cells
            .filter((_, i) => i % 7 === 0)
            .map((c) => {
              const a = (c.lat * 13 + c.lon * 7) % 360;
              const len = 0.4 + c.v;
              const dx = Math.cos((a * Math.PI) / 180) * len;
              const dy = Math.sin((a * Math.PI) / 180) * len;
              return (
                <line
                  key={`a-${c.lat}-${c.lon}`}
                  x1={x(c.lon)}
                  y1={y(c.lat)}
                  x2={x(c.lon) + dx}
                  y2={y(c.lat) + dy}
                  stroke="white"
                  strokeOpacity={0.75}
                  strokeWidth={0.14}
                />
              );
            })}

        {LAND_PATHS.map((p, i) => (
          <path
            key={i}
            d={p.d}
            transform={`translate(0,${REGION.latMax + REGION.latMin}) scale(1,-1)`}
            fill="var(--color-muted)"
            stroke="var(--color-border)"
            strokeWidth={0.12}
          />
        ))}

        {/* graticule */}
        {[10, 15, 20, 25].map((lat) => (
          <line
            key={lat}
            x1={REGION.lonMin}
            x2={REGION.lonMax}
            y1={y(lat)}
            y2={y(lat)}
            stroke="white"
            strokeOpacity={0.2}
            strokeWidth={0.08}
          />
        ))}
        {[55, 65, 75, 85, 95].map((lon) => (
          <line
            key={lon}
            y1={REGION.latMin}
            y2={REGION.latMax}
            x1={x(lon)}
            x2={x(lon)}
            stroke="white"
            strokeOpacity={0.2}
            strokeWidth={0.08}
          />
        ))}

        <text x={63} y={y(16)} fontSize={1.5} fill="var(--color-foreground)" opacity={0.75}>
          ARABIAN SEA
        </text>
        <text x={86} y={y(15)} fontSize={1.5} fill="var(--color-foreground)" opacity={0.75}>
          BAY OF BENGAL
        </text>

        <g pointerEvents="none">
          <circle
            cx={x(selected.lon)}
            cy={y(selected.lat)}
            r={0.9}
            fill="none"
            stroke="white"
            strokeWidth={0.3}
          />
          <circle cx={x(selected.lon)} cy={y(selected.lat)} r={0.22} fill="white" />
        </g>
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Click any grid cell to select a location.
        </p>
        <div className="flex items-center gap-2">
          <span className="mono-num text-[0.6875rem] text-muted-foreground">
            {meta.min} {meta.unit}
          </span>
          <span
            className="h-2.5 w-40 rounded-sm"
            style={{
              background: `linear-gradient(to right, ${[0, 0.25, 0.5, 0.72, 1]
                .map((s) => rampColor(s))
                .join(",")})`,
            }}
          />
          <span className="mono-num text-[0.6875rem] text-muted-foreground">
            {meta.max} {meta.unit}
          </span>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 361af680b982ae6f0dd3f37a73a0e53cfb117d9d
