import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Database, Gauge, Network, Thermometer, Waves, Wind } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/model")({
  head: () => ({
    meta: [
      { title: "Model & Physics | Ocean Temperature Reconstruction" },
      {
        name: "description",
        content:
          "Technical overview of satellite surface inputs, thermocline physics and the CNN encoder-decoder used for depth-wise temperature reconstruction.",
      },
      { property: "og:title", content: "Model & Physics" },
      {
        property: "og:description",
        content:
          "Physical reasoning and model architecture for reconstructing subsurface ocean temperature from surface observations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModelPage,
});

const INPUTS = [
  {
    icon: Thermometer,
    label: "SST",
    text: "Constrains the mixed-layer thermal state and surface forcing signal.",
  },
  {
    icon: Waves,
    label: "SSH",
    text: "Represents dynamic height, eddy signatures and thermocline displacement.",
  },
  {
    icon: Gauge,
    label: "Currents",
    text: "Adds advection and mesoscale circulation context around the profile point.",
  },
  {
    icon: Wind,
    label: "Winds",
    text: "Indicates mixing energy, upwelling tendency and surface stress history.",
  },
];

const ARCHITECTURE = [
  ["Input tensor", "SST, SSH, u/v currents and wind fields over the local spatial window"],
  ["Encoder", "Convolution blocks extract mesoscale spatial gradients and eddy patterns"],
  ["Latent state", "Compressed representation of surface forcing and regional regime"],
  ["Decoder", "Depth-wise reconstruction head maps latent state to 15 vertical levels"],
  ["Loss terms", "Temperature MSE with higher weight across mixed layer and thermocline"],
];

function ModelPage() {
  return (
    <AppShell>
      <PageHeader
        title="Model & Physics"
        description="Technical basis for reconstructing subsurface thermal structure from satellite-observed surface fields."
      />

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-foreground">Surface-to-depth physical linkage</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {INPUTS.map(({ icon: Icon, label, text }) => (
            <div key={label} className="border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-accent" aria-hidden />
                <h3 className="text-sm font-semibold">{label}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-4 text-sm leading-relaxed text-muted-foreground lg:grid-cols-2">
          <p>
            Sea surface height anomaly is a strong proxy for subsurface structure in the
            North Indian Ocean. Positive anomalies often indicate a depressed thermocline
            and warmer subsurface water, while negative anomalies are commonly associated
            with uplifted isotherms, cyclonic eddies and cooler upper-ocean content.
          </p>
          <p>
            Surface currents and winds provide context for horizontal advection and vertical
            mixing. Monsoon winds, coastal upwelling and eddy-driven circulation modify the
            mixed-layer depth and the sharpness of the thermocline, so the model uses local
            spatial patterns rather than a single point measurement.
          </p>
        </div>
      </section>

      <section className="panel mt-4 p-5">
        <h2 className="text-sm font-semibold text-foreground">Model flow</h2>
        <div className="mt-4 grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <div className="border border-border bg-background p-4">
            <p className="label-caps">Inputs</p>
            <p className="mt-2 text-sm font-medium">Satellite and reanalysis surface fields</p>
            <p className="mt-1 text-xs text-muted-foreground">SST · SSH · currents · winds</p>
          </div>
          <div className="hidden items-center text-muted-foreground lg:flex">
            <ArrowRight className="size-5" aria-hidden />
          </div>
          <div className="border border-border bg-background p-4">
            <p className="label-caps">CNN encoder-decoder</p>
            <p className="mt-2 text-sm font-medium">Spatial feature extraction and vertical mapping</p>
            <p className="mt-1 text-xs text-muted-foreground">Local ocean regime encoded into latent state</p>
          </div>
          <div className="hidden items-center text-muted-foreground lg:flex">
            <ArrowRight className="size-5" aria-hidden />
          </div>
          <div className="border border-border bg-background p-4">
            <p className="label-caps">Output</p>
            <p className="mt-2 text-sm font-medium">Depth-wise temperature profile</p>
            <p className="mt-1 text-xs text-muted-foreground">0, 5, 10, 20 … 1000 m</p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-foreground">Architecture summary</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <tbody className="divide-y divide-border">
                {ARCHITECTURE.map(([stage, description]) => (
                  <tr key={stage}>
                    <td className="w-40 py-2 pr-4 font-medium text-foreground">{stage}</td>
                    <td className="py-2 text-muted-foreground">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-accent" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">Training data</h2>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Primary target", "GLORYS12V1 temperature profiles"],
              ["Validation", "Profile-level holdout by year and region"],
              ["Domain", "Arabian Sea, Bay of Bengal, equatorial NIO"],
              ["Operational state", "Prototype with mock inference output"],
            ].map(([key, value]) => (
              <div key={key} className="flex gap-3">
                <dt className="w-32 shrink-0 text-muted-foreground">{key}</dt>
                <dd className="font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="panel mt-4 p-5">
        <h2 className="text-sm font-semibold text-foreground">Interpretation notes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Accuracy is expected to be strongest in the upper 300 m where satellite-linked variability is most informative.</li>
          <li>Deep-ocean temperature estimates rely more heavily on learned climatological structure and regional priors.</li>
          <li>High-error cases are expected near intense boundary currents, storm-forced mixing and sparse validation periods.</li>
        </ul>
      </section>
    </AppShell>
  );
}
