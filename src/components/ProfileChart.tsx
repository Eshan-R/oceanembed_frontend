import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DEPTH_LEVELS } from "@/lib/ocean";

export interface Series {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

export function ProfileChart({
  data,
  series,
  height = 420,
  showDepthMarkers = true,
}: {
  data: Record<string, number>[];
  series: Series[];
  height?: number;
  showDepthMarkers?: boolean;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart layout="vertical" data={data} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 3" />
          <XAxis
            type="number"
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            stroke="var(--color-border)"
            label={{
              value: "Temperature (°C)",
              position: "insideBottom",
              offset: -12,
              fontSize: 11,
              fill: "var(--color-muted-foreground)",
            }}
          />
          <YAxis
            type="number"
            dataKey="depth"
            reversed
            domain={[0, 1000]}
            ticks={[...DEPTH_LEVELS]}
            width={54}
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            stroke="var(--color-border)"
            label={{
              value: "Depth (m)",
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
              fill: "var(--color-muted-foreground)",
            }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              fontSize: 12,
            }}
            labelFormatter={(v) => `Depth ${v} m`}
            formatter={(value: number, name) => [`${value} °C`, name]}
          />
          {showDepthMarkers &&
            DEPTH_LEVELS.map((d) => (
              <ReferenceLine
                key={d}
                y={d}
                stroke="var(--color-border)"
                strokeDasharray="1 4"
              />
            ))}
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={1.8}
              strokeDasharray={s.dashed ? "5 4" : undefined}
              dot={{ r: 2.2, strokeWidth: 0 , fill: s.color }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Legend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {series.map((s) => (
        <span key={s.key} className="flex items-center gap-2">
          <span
            className="inline-block h-0 w-6 border-t-2"
            style={{
              borderColor: s.color,
              borderTopStyle: s.dashed ? "dashed" : "solid",
            }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}
