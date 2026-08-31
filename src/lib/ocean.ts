import { useSyncExternalStore } from "react";

export const DEPTH_LEVELS = [
  0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000,
] as const;

export const REGION = {
  latMin: 5,
  latMax: 30,
  lonMin: 45,
  lonMax: 105,
};

export type SurfaceVariable = "sst" | "ssh" | "currents";

export interface SelectionState {
  lat: number;
  lon: number;
  date: string;
  variable: SurfaceVariable;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

let state: SelectionState = {
  lat: 15,
  lon: 68,
  date: "2024-06-15",
  variable: "sst",
};

const listeners = new Set<() => void>();

export function setSelection(patch: Partial<SelectionState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useSelection(): SelectionState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export { todayISO };

/* ---------- deterministic mock data ---------- */

function hash(...nums: number[]) {
  let h = 2166136261;
  for (const n of nums) {
    const v = Math.round(n * 1000);
    h ^= v;
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function dayOfYear(date: string) {
  const d = new Date(date + "T00:00:00Z");
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86400000) || 1;
}

/** Mock sea surface temperature (°C) for a grid cell. */
export function surfaceValue(
  lat: number,
  lon: number,
  date: string,
  variable: SurfaceVariable,
): number {
  const doy = dayOfYear(date);
  const seasonal = Math.cos(((doy - 120) / 365) * 2 * Math.PI);
  const noise = hash(lat, lon, Math.floor(doy / 5)) - 0.5;

  if (variable === "sst") {
    const base = 30.2 - (lat - REGION.latMin) * 0.16;
    const bay = lon > 80 ? 0.7 : 0;
    return base + bay - seasonal * 1.4 + noise * 1.1;
  }
  if (variable === "ssh") {
    // dynamic height anomaly in metres
    return (
      0.12 * Math.sin(lon / 6 + doy / 40) +
      0.09 * Math.cos(lat / 4 - doy / 55) +
      noise * 0.16
    );
  }
  // current speed m/s
  return Math.abs(
    0.35 + 0.28 * Math.sin(lon / 5 - lat / 7 + doy / 60) + noise * 0.25,
  );
}

export interface ProfilePoint {
  depth: number;
  predicted: number;
  observed: number;
  uncertainty: number;
}

/** Mock predicted vertical temperature profile at a location. */
export function verticalProfile(
  lat: number,
  lon: number,
  date: string,
): ProfilePoint[] {
  const sst = surfaceValue(lat, lon, date, "sst");
  const ssh = surfaceValue(lat, lon, date, "ssh");
  const mld = 35 + ssh * 90 + hash(lat, lon) * 25; // mixed layer depth
  const thermoScale = 190 + ssh * 140;

  return DEPTH_LEVELS.map((depth) => {
    let t: number;
    if (depth <= mld) {
      t = sst - depth * 0.006;
    } else {
      const deep = 4.2 - Math.max(0, (depth - 1000) / 400);
      const decay = Math.exp(-(depth - mld) / thermoScale);
      t = deep + (sst - deep) * decay;
    }
    const jitter = (hash(lat, lon, depth) - 0.5) * 0.5;
    const predicted = t + jitter * 0.4;
    const observed = t + jitter;
    const uncertainty =
      0.18 + (depth > 50 && depth < 300 ? 0.55 : 0.12) + Math.abs(jitter) * 0.4;
    return {
      depth,
      predicted: round(predicted),
      observed: round(observed),
      uncertainty: round(uncertainty),
    };
  });
}

export function round(n: number, p = 2) {
  return Math.round(n * 10 ** p) / 10 ** p;
}

export function profileStats(points: ProfilePoint[]) {
  const n = points.length;
  const se = points.reduce((a, p) => a + (p.predicted - p.observed) ** 2, 0);
  const rmse = Math.sqrt(se / n);
  const mp = points.reduce((a, p) => a + p.predicted, 0) / n;
  const mo = points.reduce((a, p) => a + p.observed, 0) / n;
  let cov = 0,
    vp = 0,
    vo = 0;
  for (const p of points) {
    cov += (p.predicted - mp) * (p.observed - mo);
    vp += (p.predicted - mp) ** 2;
    vo += (p.observed - mo) ** 2;
  }
  const corr = cov / Math.sqrt(vp * vo || 1);
  return { rmse: round(rmse, 3), corr: round(corr, 4) };
}

/** Illustrative cyclone-induced cooling applied to a baseline profile. */
export function cycloneProfile(
  base: ProfilePoint[],
  category: number,
  translationSpeed = 5,
): { depth: number; baseline: number; cyclone: number }[] {
  const strength = 0.9 + category * 0.85; // °C surface-layer cooling scale
  const speedFactor = 6 / (translationSpeed + 2);
  const upwellDepth = 60 + category * 22;
  return base.map((p) => {
    let delta: number;
    if (p.depth <= upwellDepth) {
      delta = -strength * speedFactor * (1 - p.depth / (upwellDepth * 2.2));
    } else if (p.depth <= upwellDepth * 3) {
      // subsurface warming below the mixed layer
      delta = 0.35 * strength * speedFactor * Math.exp(-(p.depth - upwellDepth) / 120);
    } else {
      delta = 0;
    }
    return {
      depth: p.depth,
      baseline: p.predicted,
      cyclone: round(p.predicted + delta),
    };
  });
}

/** Simple blue→red ramp used for the map overlay. */
export function rampColor(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  const stops: [number, [number, number, number]][] = [
    [0, [24, 62, 120]],
    [0.25, [40, 122, 168]],
    [0.5, [96, 178, 168]],
    [0.72, [226, 186, 92]],
    [1, [178, 58, 48]],
  ];
  for (let i = 1; i < stops.length; i++) {
    const prev = stops[i - 1]!;
    const cur = stops[i]!;
    if (x <= cur[0]) {
      const f = (x - prev[0]) / (cur[0] - prev[0]);
      const c = prev[1].map((v, k) => Math.round(v + (cur[1][k]! - v) * f));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
  }
  return "rgb(178,58,48)";

}

export const VARIABLE_META: Record<
  SurfaceVariable,
  { label: string; unit: string; min: number; max: number }
> = {
  sst: { label: "Sea Surface Temperature", unit: "°C", min: 22, max: 32 },
  ssh: { label: "Sea Surface Height Anomaly", unit: "m", min: -0.3, max: 0.3 },
  currents: { label: "Surface Current Speed", unit: "m/s", min: 0, max: 1.1 },
};
