"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  LabelList,
} from "recharts";

type Forecast = {
  id: number;
  predicted_price: number;
  maturation_date: string | null;
  prediction_date: string | null;
  publisher_id: number | null;
};

type Publisher = {
  id: number;
  institution: string | null;
};

export default function PriceTargetTooltipChart({
  forecasts,
  publishers,
  currentPrice,
}: Props) {
  const current = Number(currentPrice) || 0;

  const data = forecasts
    .filter((f) => f.predicted_price > 0 && f.prediction_date)
    .map((f) => {
      const publisher =
        publishers.find((p) => p.id === f.publisher_id)?.institution ??
        "Unknown";

      const upside =
        current > 0
          ? ((f.predicted_price / current) - 1) * 100
          : null;

      return {
        x: new Date(f.prediction_date!).getTime(),
        y: Number(f.predicted_price),
        prediction_date: f.prediction_date,
        publisher,
        rating: f.rating,
        prev_rating: f.prev_rating,
        action: f.action,
        upside,
      };
    })
    .sort((a, b) => a.x - b.x);

  const prices = forecasts
    .map((f) => f.predicted_price)
    .filter((p): p is number => p != null && p > 0);

  //const current = Number(currentPrice) || 0;

  const minForecast = prices.length ? Math.min(...prices) : current;
  const maxForecast = prices.length ? Math.max(...prices) : current;

  const referenceMin = Math.min(minForecast, current);
  const buffer = referenceMin * 0.05;

  const yMin = Math.max(0, referenceMin - buffer);
  const yMax = maxForecast * 1.05;

  return (
    <div className="w-[800px] h-[520px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 120,
            left: 20,
            bottom: 20,
          }}
        >
          <XAxis
            dataKey="x"
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
            ticks={[...new Set(data.map((d) => d.x))]}
            tickFormatter={(v) =>
              new Date(v).toISOString().slice(0, 10)
            }
            tickCount={5}
            interval="preserveStartEnd"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            type="number"
            domain={[yMin, yMax]}
            tick={{ fontSize: 11 }}
          />

          {current && (
            <ReferenceLine
              y={currentPrice}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{
                value: `Current ${current.toFixed(2)}`,
                position: "right",
                fill: "#f59e0b",
                fontSize: 11,
              }}
            />
          )}

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const d = payload[0].payload;

              return (
                <div className="min-w-[230px] rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs shadow-xl">
                  {/* Publisher */}
                  <div className="mb-3 font-semibold text-white">
                    {d.publisher}
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400">Target</span>
                      <span className="font-medium text-white">
                        {d.y.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400">Current</span>
                      <span className="text-white">
                        {current.toFixed(2) ?? "—"}
                      </span>
                    </div>

                    {/* Upside */}
                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400">Upside</span>
                      <span
                        className={
                          d.upside != null && d.upside >= 0
                            ? "font-semibold text-emerald-400"
                            : "font-semibold text-red-400"
                        }
                      >
                        {d.upside != null
                          ? `${d.upside >= 0 ? "+" : ""}${d.upside.toFixed(1)}%`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="mt-3 border-t border-slate-800 pt-3 space-y-1.5">
                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400">Rating</span>
                      <span className="font-medium text-white">
                        {d.rating ?? "—"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400">Previous</span>
                      <span className="text-slate-300">
                        {d.prev_rating ?? "—"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400">Action</span>
                      <span className="font-medium text-white">
                        {d.action ?? "—"}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mt-3 border-t border-slate-800 pt-2 text-slate-500">
                    Published {d.prediction_date}
                  </div>
                </div>
              );
            }}
          />

            <Scatter
              data={data}
              dataKey="y"
              shape={(props: any) => {
                const { cx, cy, payload } = props;

                const action = payload.action?.toLowerCase() ?? "";

                let fill = "#60a5fa";

                if (
                  action.includes("upgrade") ||
                  action.includes("up")
                ) {
                  fill = "#22c55e";
                } else if (
                  action.includes("downgrade") ||
                  action.includes("down")
                ) {
                  fill = "#ef4444";
                }

                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={fill}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                );
              }}
            >
              <LabelList
                dataKey="publisher"
                position="right"
                fontSize={10}
              />
            </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}