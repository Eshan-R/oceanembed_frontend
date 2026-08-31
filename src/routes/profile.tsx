import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Legend, ProfileChart, type Series } from "@/components/ProfileChart";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { profileStats, round, useSelection, verticalProfile } from "@/lib/ocean";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Vertical Profile Viewer | Subsurface Temperature Reconstruction" },
      {
        name: "description",
        content:
          "Depth-versus-temperature profile from 0 to 1000 m at the selected location, with observed overlay, RMSE and correlation.",
      },
      { property: "og:title", content: "Vertical Profile Viewer" },
      {
        property: "og:description",
        content: "Predicted versus observed temperature profiles at 15 standard depth levels.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const sel = useSelection();
  const [showObserved, setShowObserved] = useState(true);
  const profile = useMemo(
    () => verticalProfile(sel.lat, sel.lon, sel.date),
    [sel.lat, sel.lon, sel.date],
  );
  const stats = useMemo(() => profileStats(profile), [profile]);

  const series: Series[] = [
    { key: "predicted", label: "Predicted (model)", color: "var(--color-chart-1)" },
    ...(showObserved
      ? [
          {
            key: "observed",
            label: "Observed (GLORYS)",
            color: "var(--color-chart-2)",
            dashed: true,
          } satisfies Series,
        ]
      : []),
  ];

  const mld =
    profile.find((p, i) => i > 0 && profile[0]!.predicted - p.predicted > 0.5)?.depth ??
    profile[0]!.depth;

  return (
    <AppShell>
      <PageHeader
        title="Vertical Profile Viewer"
        description={`Temperature structure at ${sel.lat.toFixed(2)}°N, ${sel.lon.toFixed(2)}°E on ${sel.date}.`}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/map">Change location on map</Link>
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <Legend series={series} />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={showObserved} onCheckedChange={setShowObserved} />
              Overlay observed profile
            </label>
          </div>
          <ProfileChart data={profile as unknown as Record<string, number>[]} series={series} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="panel p-4">
            <p className="label-caps">Validation metrics</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">RMSE</dt>
                <dd className="mono-num font-medium">{stats.rmse} °C</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Correlation (r)</dt>
                <dd className="mono-num font-medium">{stats.corr}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Surface temperature</dt>
                <dd className="mono-num font-medium">{profile[0]!.predicted} °C</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Est. mixed-layer depth</dt>
                <dd className="mono-num font-medium">{mld} m</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Temperature at 1000 m</dt>
                <dd className="mono-num font-medium">
                  {profile[profile.length - 1]!.predicted} °C
                </dd>
              </div>
            </dl>
          </div>

          <div className="panel overflow-hidden">
            <p className="label-caps border-b border-border px-4 py-2.5">
              Standard depth levels
            </p>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Depth (m)</th>
                    <th className="px-4 py-2 text-right font-medium">Pred (°C)</th>
                    <th className="px-4 py-2 text-right font-medium">Obs (°C)</th>
                    <th className="px-4 py-2 text-right font-medium">Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {profile.map((p) => (
                    <tr key={p.depth}>
                      <td className="mono-num px-4 py-1.5">{p.depth}</td>
                      <td className="mono-num px-4 py-1.5 text-right">{p.predicted}</td>
                      <td className="mono-num px-4 py-1.5 text-right text-muted-foreground">
                        {p.observed}
                      </td>
                      <td className="mono-num px-4 py-1.5 text-right">
                        {round(p.predicted - p.observed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
