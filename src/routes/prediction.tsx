import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  REGION,
  round,
  setSelection,
  surfaceValue,
  useSelection,
  verticalProfile,
} from "@/lib/ocean";

export const Route = createFileRoute("/prediction")({
  head: () => ({
    meta: [
      { title: "Prediction Panel | Ocean Temperature Reconstruction" },
      {
        name: "description",
        content:
          "Run mock depth-wise subsurface temperature reconstruction for a North Indian Ocean coordinate and date.",
      },
      { property: "og:title", content: "Prediction Panel" },
      {
        property: "og:description",
        content:
          "Coordinate and date controls for reconstructed temperature at 15 standard ocean depths.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PredictionPage,
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function confidenceFromUncertainty(uncertainty: number) {
  return clamp(100 - uncertainty * 28, 62, 96);
}

function PredictionPage() {
  const sel = useSelection();
  const [lat, setLat] = useState(sel.lat);
  const [lon, setLon] = useState(sel.lon);
  const [date, setDate] = useState(sel.date);
  const [status, setStatus] = useState<"idle" | "running" | "complete">("idle");

  const profile = useMemo(() => verticalProfile(sel.lat, sel.lon, sel.date), [
    sel.lat,
    sel.lon,
    sel.date,
  ]);
  const sst = surfaceValue(sel.lat, sel.lon, sel.date, "sst");
  const ssh = surfaceValue(sel.lat, sel.lon, sel.date, "ssh");
  const currents = surfaceValue(sel.lat, sel.lon, sel.date, "currents");

  function runPrediction() {
    const nextLat = round(clamp(lat, REGION.latMin, REGION.latMax), 2);
    const nextLon = round(clamp(lon, REGION.lonMin, REGION.lonMax), 2);
    setLat(nextLat);
    setLon(nextLon);
    setStatus("running");
    window.setTimeout(() => {
      setSelection({ lat: nextLat, lon: nextLon, date });
      setStatus("complete");
    }, 650);
  }

  return (
    <AppShell>
      <PageHeader
        title="Prediction Panel"
        description="Coordinate-driven reconstruction at 15 standard depth levels using deterministic placeholder model output."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/map">Select point on map</Link>
          </Button>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="panel p-4">
          <h2 className="text-sm font-semibold text-foreground">Input controls</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="label-caps">Latitude</span>
              <input
                type="number"
                value={lat}
                min={REGION.latMin}
                max={REGION.latMax}
                step="0.25"
                onChange={(e) => setLat(Number(e.target.value))}
                className="mono-num mt-1.5 h-9 w-full rounded border border-input bg-background px-2 text-sm"
              />
            </label>
            <Slider
              min={REGION.latMin}
              max={REGION.latMax}
              step={0.25}
              value={[lat]}
              onValueChange={([v]) => setLat(v ?? REGION.latMin)}
            />

            <label className="block">
              <span className="label-caps">Longitude</span>
              <input
                type="number"
                value={lon}
                min={REGION.lonMin}
                max={REGION.lonMax}
                step="0.25"
                onChange={(e) => setLon(Number(e.target.value))}
                className="mono-num mt-1.5 h-9 w-full rounded border border-input bg-background px-2 text-sm"
              />
            </label>
            <Slider
              min={REGION.lonMin}
              max={REGION.lonMax}
              step={0.25}
              value={[lon]}
              onValueChange={([v]) => setLon(v ?? REGION.lonMin)}
            />

            <label className="block">
              <span className="label-caps">Date</span>
              <input
                type="date"
                value={date}
                min="2024-01-01"
                max="2024-12-31"
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="mono-num mt-1.5 h-9 w-full rounded border border-input bg-background px-2 text-sm"
              />
            </label>

            <Button className="w-full" onClick={runPrediction} disabled={status === "running"}>
              {status === "running" ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Running prediction
                </>
              ) : (
                "Run Prediction"
              )}
            </Button>
          </div>
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Predicted profile</h2>
                <p className="mono-num mt-1 text-xs text-muted-foreground">
                  {sel.lat.toFixed(2)}°N, {sel.lon.toFixed(2)}°E · {sel.date}
                </p>
              </div>
              {status === "complete" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                  <CheckCircle2 className="size-4" aria-hidden />
                  Complete
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-0 divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {[
              ["SST", `${round(sst, 2)} °C`],
              ["SSH anomaly", `${round(ssh, 3)} m`],
              ["Current speed", `${round(currents, 2)} m/s`],
            ].map(([label, value]) => (
              <div key={label} className="p-4">
                <p className="label-caps">{label}</p>
                <p className="mono-num mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Depth (m)</th>
                  <th className="px-4 py-2 text-right font-medium">Predicted temp (°C)</th>
                  <th className="px-4 py-2 text-right font-medium">Uncertainty (±°C)</th>
                  <th className="px-4 py-2 text-left font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profile.map((point) => {
                  const confidence = confidenceFromUncertainty(point.uncertainty);
                  return (
                    <tr key={point.depth}>
                      <td className="mono-num px-4 py-2">{point.depth}</td>
                      <td className="mono-num px-4 py-2 text-right font-medium">
                        {point.predicted}
                      </td>
                      <td className="mono-num px-4 py-2 text-right text-muted-foreground">
                        {point.uncertainty}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-28 rounded-sm bg-secondary">
                            <div
                              className="h-2 rounded-sm bg-accent"
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                          <span className="mono-num text-xs text-muted-foreground">
                            {round(confidence, 0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
