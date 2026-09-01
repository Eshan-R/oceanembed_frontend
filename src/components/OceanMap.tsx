import React, { useEffect, useState } from "react";

import {
  VARIABLE_META,
  rampColor,
  type SurfaceVariable,
} from "@/lib/ocean";

interface OceanMapProps {
  date: string;
  variable: SurfaceVariable;
  selected: { lat: number; lon: number };
  onSelect: (lat: number, lon: number) => void;
}

/** Lazy-loads the Leaflet map client so Leaflet never runs server-side. */
export function OceanMap(props: OceanMapProps) {
  const [MapClient, setMapClient] = useState<React.ElementType | null>(null);

  useEffect(() => {
    import("./OceanMapClient").then((m) => {
      setMapClient(() => m.default);
    });
  }, []);

  if (!MapClient) {
    return (
      <div className="panel flex h-[520px] items-center justify-center">
        <span className="animate-pulse text-sm text-muted-foreground">
          Initialising map layers…
        </span>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      {/* Leaflet map — z-0 keeps popups below our sticky header */}
      <div className="relative z-0 h-[520px] w-full">
        <MapClient {...props} />
      </div>
      <Legend variable={props.variable} />
    </div>
  );
}

function Legend({ variable }: { variable: SurfaceVariable }) {
  const meta = VARIABLE_META[variable];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2">
      <p className="text-xs text-muted-foreground">
        Click the map to select a grid point.
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
  );
}
