import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, Layers, MapPinned, Cpu } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { DEPTH_LEVELS } from "@/lib/ocean";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Subsurface Ocean Temperature Reconstruction | North Indian Ocean" },
      {
        name: "description",
        content:
          "Deep-learning reconstruction of 0-1000 m ocean temperature from satellite surface observations across the North Indian Ocean.",
      },
      {
        property: "og:title",
        content: "Subsurface Ocean Temperature Reconstruction",
      },
      {
        property: "og:description",
        content:
          "Reconstructing subsurface ocean temperature from satellite surface fields for the Arabian Sea and Bay of Bengal.",
      },
    ],
  }),
  component: Home,
});

const STATS = [
  {
    icon: MapPinned,
    label: "Region covered",
    value: "5°N – 30°N, 45°E – 105°E",
    note: "Arabian Sea & Bay of Bengal",
  },
  {
    icon: Layers,
    label: "Depth range",
    value: "0 – 1000 m",
    note: `${DEPTH_LEVELS.length} standard levels`,
  },
  {
    icon: Database,
    label: "Data source",
    value: "GLORYS12V1 / CMEMS",
    note: "Daily reanalysis, 1/12° grid",
  },
  {
    icon: Cpu,
    label: "Model type",
    value: "CNN encoder–decoder",
    note: "Surface fields → depth profile",
  },
];

function Home() {
  return (
    <AppShell>
      <PageHeader
        title="Project overview"
        description="Operational research dashboard for subsurface thermal structure reconstruction."
      />

      <section className="panel p-5">
        <p className="label-caps">Scope</p>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-foreground">
          This system reconstructs the subsurface ocean temperature field of the North
          Indian Ocean from satellite-observed surface variables — sea surface
          temperature, sea surface height, surface currents and winds — using a deep
          learning model trained on CMEMS GLORYS12V1 reanalysis. For any selected
          location and date, the model estimates temperature at 15 standard depth
          levels between the surface and 1000 m, capturing mixed-layer depth,
          thermocline structure and mesoscale eddy signatures. Outputs support cyclone
          heat-potential assessment, monsoon studies and ocean-state monitoring for the
          Arabian Sea and Bay of Bengal.
        </p>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ icon: Icon, label, value, note }) => (
          <div key={label} className="panel p-4">
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-accent" aria-hidden />
              <p className="label-caps">{label}</p>
            </div>
            <p className="mono-num mt-2 text-sm font-semibold text-foreground">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Link
          to="/map"
          className="panel flex items-center justify-between gap-3 bg-primary p-4 text-primary-foreground transition-opacity hover:opacity-95"
        >
          <span>
            <span className="block text-sm font-semibold">Open Ocean Map</span>
            <span className="block text-xs opacity-80">
              Browse surface fields and select a grid point
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </Link>
        <Link
          to="/prediction"
          className="panel flex items-center justify-between gap-3 p-4 transition-colors hover:bg-secondary"
        >
          <span>
            <span className="block text-sm font-semibold">Prediction Panel</span>
            <span className="block text-xs text-muted-foreground">
              Run a depth-wise reconstruction for a coordinate
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </Link>
        <Link
          to="/profile"
          className="panel flex items-center justify-between gap-3 p-4 transition-colors hover:bg-secondary"
        >
          <span>
            <span className="block text-sm font-semibold">Vertical Profile Viewer</span>
            <span className="block text-xs text-muted-foreground">
              Compare predicted vs observed profiles
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </Link>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="panel p-5">
          <p className="label-caps">Model status</p>
          <table className="mt-3 w-full text-sm">
            <tbody className="divide-y divide-border">
              {[
                ["Training period", "2010-01-01 – 2020-12-31"],
                ["Validation period", "2021-01-01 – 2022-12-31"],
                ["Mean RMSE (0–1000 m)", "0.412 °C"],
                ["Mean correlation", "0.978"],
                ["Grid resolution", "0.25° (analysis grid)"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="py-2 pr-4 text-muted-foreground">{k}</td>
                  <td className="mono-num py-2 text-right font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel p-5">
          <p className="label-caps">Notes</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              All values displayed in this build are mock fields generated locally; the
              inference API is not yet connected.
            </li>
            <li>
              Cyclone simulation output is illustrative and does not use the trained
              model.
            </li>
            <li>
              Vertical levels follow the standard set used for profile validation
              against Argo floats.
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
