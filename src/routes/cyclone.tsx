import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Legend, ProfileChart, type Series } from "@/components/ProfileChart";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cycloneProfile, round, useSelection, verticalProfile } from "@/lib/ocean";

export const Route = createFileRoute("/cyclone")({
  head: () => ({
    meta: [
      { title: "Cyclone Simulation | Ocean Temperature Reconstruction" },
      {
        name: "description",
        content:
          "Illustrative cyclone-induced upper-ocean cooling simulation comparing baseline and storm-modified temperature profiles.",
      },
      { property: "og:title", content: "Cyclone Simulation" },
      {
        property: "og:description",
        content:
          "Explore simplified subsurface cooling and upwelling response for hypothetical cyclone intensity over the North Indian Ocean.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CyclonePage,
});

const series: Series[] = [
  { key: "baseline", label: "Baseline prediction", color: "var(--color-chart-1)" },
  { key: "cyclone", label: "After cyclone", color: "var(--color-chart-5)", dashed: true },
];

function CyclonePage() {
  const sel = useSelection();
  const [category, setCategory] = useState(3);
  const [speed, setSpeed] = useState(5);
  const base = useMemo(() => verticalProfile(sel.lat, sel.lon, sel.date), [
    sel.lat,
    sel.lon,
    sel.date,
  ]);
  const simulated = useMemo(() => cycloneProfile(base, category, speed), [base, category, speed]);
  const surface = simulated.find((point) => point.depth === 0);
  const depth100 = simulated.find((point) => point.depth === 100);
  const surfaceCooling = surface ? round(surface.cyclone - surface.baseline, 2) : 0;
  const cooling100 = depth100 ? round(depth100.cyclone - depth100.baseline, 2) : 0;

  return (
    <AppShell>
      <PageHeader
        title="Cyclone Simulation"
        description="Simulation - illustrative only, not a live physical model."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/map">Change location</Link>
          </Button>
        }
      />

      <div className="mb-3 flex items-start gap-2 border border-border bg-secondary p-3 text-sm text-secondary-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        <p>
          This panel applies simplified cooling and upwelling logic to the selected profile
          for qualitative inspection only; it does not call the reconstruction model.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="panel p-4">
          <h2 className="text-sm font-semibold text-foreground">Scenario controls</h2>
          <div className="mt-4 space-y-5">
            <label className="block">
              <span className="label-caps">Cyclone category</span>
              <select
                value={category}
                onChange={(e) => setCategory(Number(e.target.value))}
                className="mt-1.5 h-9 w-full rounded border border-input bg-background px-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map((c) => (
                  <option key={c} value={c}>
                    Category {c}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="flex justify-between gap-3">
                <span className="label-caps">Translation speed</span>
                <span className="mono-num text-xs text-muted-foreground">{speed} m/s</span>
              </div>
              <Slider
                className="mt-3"
                min={2}
                max={10}
                step={1}
                value={[speed]}
                onValueChange={([v]) => setSpeed(v ?? 5)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border bg-background p-3">
                <p className="label-caps">Selected point</p>
                <p className="mono-num mt-1 text-sm font-medium">
                  {sel.lat.toFixed(2)}°N
                  <br />
                  {sel.lon.toFixed(2)}°E
                </p>
              </div>
              <div className="border border-border bg-background p-3">
                <p className="label-caps">Date</p>
                <p className="mono-num mt-1 text-sm font-medium">{sel.date}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setCategory(3);
                setSpeed(5);
              }}
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset scenario
            </Button>
          </div>
        </section>

        <section className="panel p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <Legend series={series} />
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="border border-border bg-background px-2 py-1">
                Surface Δ: <span className="mono-num font-medium">{surfaceCooling} °C</span>
              </span>
              <span className="border border-border bg-background px-2 py-1">
                100 m Δ: <span className="mono-num font-medium">{cooling100} °C</span>
              </span>
            </div>
          </div>
          <ProfileChart data={simulated as unknown as Record<string, number>[]} series={series} />
        </section>
      </div>

      <section className="panel mt-3 overflow-hidden">
        <div className="border-b border-border px-4 py-2.5">
          <h2 className="text-sm font-semibold text-foreground">Before / after levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Depth (m)</th>
                <th className="px-4 py-2 text-right font-medium">Baseline (°C)</th>
                <th className="px-4 py-2 text-right font-medium">Cyclone profile (°C)</th>
                <th className="px-4 py-2 text-right font-medium">Change (°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {simulated.map((point) => (
                <tr key={point.depth}>
                  <td className="mono-num px-4 py-2">{point.depth}</td>
                  <td className="mono-num px-4 py-2 text-right">{point.baseline}</td>
                  <td className="mono-num px-4 py-2 text-right font-medium">{point.cyclone}</td>
                  <td className="mono-num px-4 py-2 text-right text-muted-foreground">
                    {round(point.cyclone - point.baseline, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
