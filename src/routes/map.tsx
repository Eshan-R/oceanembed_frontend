import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Navigation } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { OceanMap } from "@/components/OceanMap";
import {
  REGION,
  VARIABLE_META,
  setSelection,
  useSelection,
  type SurfaceVariable,
} from "@/lib/ocean";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Ocean Map | OceanEmbed" },
      {
        name: "description",
        content:
          "Interactive North Indian Ocean map showing sea surface temperature, SSH anomaly and surface current speed overlays. Click any point to load its depth profile.",
      },
    ],
  }),
  component: MapPage,
});

const VARIABLES: { value: SurfaceVariable; label: string }[] = [
  { value: "sst", label: "SST" },
  { value: "ssh", label: "SSH Anomaly" },
  { value: "currents", label: "Current Speed" },
];

function MapPage() {
  const { lat, lon, date, variable } = useSelection();
  const meta = VARIABLE_META[variable];

  return (
    <AppShell>
      <PageHeader
        title="Ocean Map"
        description="North Indian Ocean — 5°N–30°N, 45°E–105°E. Click the map to select a grid point and load its subsurface temperature profile."
        actions={
          <div className="flex gap-2">
            <Link
              to="/profile"
              className="panel inline-flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
            >
              View profile
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              to="/prediction"
              className="inline-flex items-center gap-1.5 rounded border border-transparent bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              Run prediction
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        }
      />

      {/* ── Controls ── */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {/* Variable selector */}
        <div className="flex items-center gap-1 rounded border border-border bg-card p-0.5">
          {VARIABLES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelection({ variable: value })}
              className={
                variable === value
                  ? "rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                  : "rounded px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-2">
          <label className="label-caps" htmlFor="map-date">
            Date
          </label>
          <input
            id="map-date"
            type="date"
            value={date}
            min={`${REGION.latMin}`}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) =>
              e.target.value && setSelection({ date: e.target.value })
            }
            className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* ── Leaflet map ── */}
      <OceanMap
        variable={variable}
        date={date}
        selected={{ lat, lon }}
        onSelect={(newLat, newLon) => setSelection({ lat: newLat, lon: newLon })}
      />

      {/* ── Selected point info ── */}
      <div className="mt-3 panel flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="size-3.5 shrink-0 text-accent" aria-hidden />
          <span className="text-muted-foreground">Selected point</span>
          <span className="mono-num font-medium text-foreground">
            {lat.toFixed(2)}°N,&nbsp;{lon.toFixed(2)}°E
          </span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Displaying </span>
          <span className="font-medium text-foreground">{meta.label}</span>
          <span className="text-muted-foreground"> on </span>
          <span className="mono-num font-medium text-foreground">{date}</span>
        </div>
        <div className="ml-auto flex gap-2">
          <Link
            to="/profile"
            className="panel px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
          >
            Depth profile →
          </Link>
          <Link
            to="/prediction"
            className="rounded border border-transparent bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
          >
            Predict →
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
