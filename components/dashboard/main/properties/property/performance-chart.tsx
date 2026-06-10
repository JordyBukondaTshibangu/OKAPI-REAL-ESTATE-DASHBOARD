"use client";

import { Activity, Eye, Heart, Share2 } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PropertyPerformance } from "@/types";

const chartConfig = {
  viewed: { label: "Viewed", color: "var(--brand-blue)" },
  shared: { label: "Shared", color: "var(--brand-gold)" },
  saved: { label: "Saved", color: "#f43f5e" },
} satisfies ChartConfig;

type Props = {
  performance: PropertyPerformance;
  listedDaysAgo?: number | null;
};

type SeriesPoint = {
  date: string;
  viewed: number;
  shared: number;
  saved: number;
};

const DAY_MS = 86_400_000;
const MAX_POINTS = 30;

/**
 * The backend stores running totals only (no per-event timestamps), so the
 * curve distributes each total cumulatively from the listing date to today.
 */
function buildSeries(
  performance: PropertyPerformance,
  listedDaysAgo: number,
): SeriesPoint[] {
  const days = Math.max(listedDaysAgo, 1);
  const step = Math.max(1, Math.ceil(days / MAX_POINTS));
  const now = Date.now();
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });

  const offsets: number[] = [];
  for (let d = 0; d <= days; d += step) offsets.push(d);
  if (offsets[offsets.length - 1] !== days) offsets.push(days);

  return offsets.map((d) => {
    const progress = d / days;
    return {
      date: formatter.format(new Date(now - (days - d) * DAY_MS)),
      viewed: Math.round(performance.viewed * progress),
      shared: Math.round(performance.shared * progress),
      saved: Math.round(performance.saved * progress),
    };
  });
}

function PerformanceChart({ performance, listedDaysAgo }: Props) {
  const series = useMemo(
    () => buildSeries(performance, listedDaysAgo ?? 0),
    [performance, listedDaysAgo],
  );

  const stats = [
    { icon: Eye, label: "Viewed", value: performance.viewed, color: "text-brand-blue", bg: "bg-brand-blue/10" },
    { icon: Share2, label: "Shared", value: performance.shared, color: "text-brand-gold", bg: "bg-brand-gold/10" },
    { icon: Heart, label: "Saved", value: performance.saved, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <Card className="card-luxury">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="size-4 text-brand-blue" />
          Performance
          <span className="text-xs font-normal text-muted-foreground">
            since listing
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Totals */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-border/50 p-3"
            >
              <div className={`p-2 rounded-lg shrink-0 ${bg}`}>
                <Icon className={`size-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-foreground leading-none">
                  {value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trend over time */}
        <ChartContainer config={chartConfig} className="h-56 w-full">
          <AreaChart
            accessibilityLayer
            data={series}
            margin={{ left: 0, right: 12, top: 4 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              width={32}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              {(["viewed", "shared", "saved"] as const).map((key) => (
                <linearGradient
                  key={key}
                  id={`fill-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              ))}
            </defs>
            <Area
              dataKey="viewed"
              type="monotone"
              fill="url(#fill-viewed)"
              stroke="var(--color-viewed)"
              strokeWidth={2}
            />
            <Area
              dataKey="shared"
              type="monotone"
              fill="url(#fill-shared)"
              stroke="var(--color-shared)"
              strokeWidth={2}
            />
            <Area
              dataKey="saved"
              type="monotone"
              fill="url(#fill-saved)"
              stroke="var(--color-saved)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>

        <p className="text-[11px] text-muted-foreground -mt-2">
          Estimated trend — totals are distributed evenly from the listing date
          to today.
        </p>
      </CardContent>
    </Card>
  );
}

export default PerformanceChart;
