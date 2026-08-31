import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Database, FileText, ShieldCheck } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Documentation | Ocean Temperature Reconstruction" },
      {
        name: "description",
        content:
          "Documentation for the North Indian Ocean subsurface temperature reconstruction prototype, data sources, assumptions and limitations.",
      },
      { property: "og:title", content: "About & Documentation" },
      {
        property: "og:description",
        content:
          "Method notes, data provenance, usage guidance and limitations for the ocean temperature reconstruction dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const DOCUMENTS = [
  {
    icon: Database,
    title: "Data provenance",
    rows: [
      ["Surface and target fields", "CMEMS GLORYS12V1 reanalysis"],
      ["Domain", "5°N–30°N, 45°E–105°E"],
      ["Vertical levels", "15 standard depths from 0 to 1000 m"],
    ],
  },
  {
    icon: ShieldCheck,
    title: "Operational status",
    rows: [
      ["Current build", "Research prototype with deterministic mock fields"],
      ["Backend integration", "Planned model API and persisted runs"],
      ["Decision use", "Scientific screening; not a navigation or warning product"],
    ],
  },
];

function AboutPage() {
  return (
    <AppShell>
      <PageHeader
        title="About / Documentation"
        description="Reference notes for data, assumptions, interface scope and planned integration path."
        actions={
          <Button asChild size="sm">
            <Link to="/prediction">Open prediction panel</Link>
          </Button>
        }
      />

      <section className="panel p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-accent" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">Project purpose</h2>
        </div>
        <p className="mt-3 max-w-5xl text-sm leading-relaxed text-muted-foreground">
          OceanEmbed is a research-facing interface for reconstructing subsurface ocean
          temperature in the North Indian Ocean using satellite-accessible surface
          observations. The tool is structured for rapid inspection of spatial surface
          fields, point-level vertical profiles, tabular depth outputs and simplified
          storm-response scenarios while the live inference service is still pending.
        </p>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {DOCUMENTS.map(({ icon: Icon, title, rows }) => (
          <section key={title} className="panel p-5">
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-accent" aria-hidden />
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {rows.map(([key, value]) => (
                <div key={key} className="grid gap-1 border-b border-border pb-2 last:border-b-0 sm:grid-cols-[180px_1fr]">
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="panel mt-4 p-5">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-accent" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">Module guide</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Section</th>
                <th className="px-4 py-2 text-left font-medium">Purpose</th>
                <th className="px-4 py-2 text-left font-medium">Current data state</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Ocean Map", "Select grid points and inspect surface overlays", "Mock SST, SSH and current fields"],
                ["Vertical Profile Viewer", "Compare predicted and observed temperature curves", "Mock profile and validation metrics"],
                ["Prediction Panel", "Run coordinate/date profile reconstruction", "Deterministic local placeholder output"],
                ["Cyclone Simulation", "Inspect simplified upper-ocean storm cooling", "Illustrative scenario logic only"],
              ].map(([section, purpose, state]) => (
                <tr key={section}>
                  <td className="px-4 py-2 font-medium text-foreground">{section}</td>
                  <td className="px-4 py-2 text-muted-foreground">{purpose}</td>
                  <td className="px-4 py-2 text-muted-foreground">{state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel mt-4 p-5">
        <h2 className="text-sm font-semibold text-foreground">Limitations and next steps</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Displayed fields are generated placeholders and should not be interpreted as observed ocean state.</li>
          <li>The planned backend will replace local mock functions with authenticated model inference and run history.</li>
          <li>Validation against Argo, mooring and reanalysis subsets should be documented before operational use.</li>
          <li>Uncertainty estimates are illustrative until calibrated ensemble or probabilistic outputs are connected.</li>
        </ul>
      </section>
    </AppShell>
  );
}
