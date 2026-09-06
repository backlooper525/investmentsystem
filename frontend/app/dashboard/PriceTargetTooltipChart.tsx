"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  LabelList,
} from "recharts";
import { clientApiFetch } from "@/lib/api";

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

type PriceHistoryResponse = {
  ticker: string;
  history: { date: string; close: number }[];
};

type Props = {
  forecasts: Forecast[];
  publishers: Publisher[];
  currentPrice: number | string | undefined;
  ticker: string;
};

export default function PriceTargetTooltipChart({
  forecasts,
  publishers,
  currentPrice,
  ticker,
}: Props) {
  const current = Number(currentPrice) || 0;

  const [priceSeries, setPriceSeries] = useState<{ x: number; close: number }[]>([]);
  const [hovered, setHovered] = useState<{ point: any; cx: number; cy: number } | null>(null);

  useEffect(() => {
    if (!ticker) return;

    const predictionDates = forecasts
      .map((f) => f.prediction_date)
      .filter((d): d is string => !!d)
      .sort();

    const start = predictionDates[0] ?? new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    let cancelled = false;

    clientApiFetch<PriceHistoryResponse>(
      `/fetch/${ticker}/history?start=${start}`
    )
      .then((res) => {
        if (cancelled) return;
        setPriceSeries(
          res.history.map((h) => ({
            x: new Date(h.date).getTime(),
            close: h.close,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setPriceSeries([]);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, forecasts]);

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

  const historyPrices = priceSeries
    .map((h) => h.close)
    .filter((p): p is number => p != null && p > 0);

  const allPrices = [...prices, ...historyPrices, ...(current > 0 ? [current] : [])];

  const minPrice = allPrices.length ? Math.min(...allPrices) : current;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : current;

  // Round the axis bounds to a "nice" step (1/2/5 x a power of ten) so the
  // gridlines land on round numbers instead of whatever minPrice*0.95 works out to.
  const niceStep = (rawRange: number) => {
    const roughStep = rawRange / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep || 1)));
    const residual = roughStep / magnitude;
    if (residual > 5) return 10 * magnitude;
    if (residual > 2) return 5 * magnitude;
    if (residual > 1) return 2 * magnitude;
    return magnitude;
  };

  const rawMin = Math.max(0, minPrice - minPrice * 0.05);
  const rawMax = maxPrice * 1.05;
  const step = niceStep(Math.max(rawMax - rawMin, 1e-6));

  const yMin = Math.max(0, Math.floor(rawMin / step) * step);
  const yMax = Math.ceil(rawMax / step) * step;

  const yTicks: number[] = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) {
    yTicks.push(Number(v.toFixed(6)));
  }

  const allX = [...data.map((d) => d.x), ...priceSeries.map((h) => h.x)];
  const xDomain: [number, number] | undefined = allX.length
    ? [Math.min(...allX), Math.max(...allX)]
    : undefined;

  return (
    <div className="relative w-[800px] h-[520px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
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
            domain={xDomain ?? ["dataMin", "dataMax"]}
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
            ticks={yTicks}
            tickFormatter={(v) => v.toFixed(2)}
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
              // The forecast dots have their own hover-driven tooltip below,
              // rendered manually — Recharts' shared nearest-point lookup
              // isn't reliable once a dense Line shares the axis with a
              // sparse Scatter, so don't let this one fight with that.
              if (hovered) return null;
              if (!active || !payload?.length) return null;

              const priceEntry = payload.find((p) => p.dataKey === "close");
              if (!priceEntry) return null;

              const p = priceEntry.payload;
              return (
                <div className="min-w-[160px] rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs shadow-xl">
                  <div className="flex justify-between gap-6">
                    <span className="text-slate-400">Price</span>
                    <span className="font-medium text-white">
                      {Number(p.close).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 text-slate-500">
                    {new Date(p.x).toISOString().slice(0, 10)}
                  </div>
                </div>
              );
            }}
          />

            <Line
              data={priceSeries}
              type="monotone"
              dataKey="close"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Price"
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
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered({ point: payload, cx, cy })}
                    onMouseLeave={() => setHovered(null)}
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
        </ComposedChart>
      </ResponsiveContainer>

      {hovered && (
        <>
          <div
            className="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-slate-400/50"
            style={{ left: hovered.cx }}
          />
          <div
            className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-slate-400/50"
            style={{ top: hovered.cy }}
          />
        </>
      )}

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 min-w-[230px] rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs shadow-xl"
          style={{
            left: hovered.cx + 14,
            top: hovered.cy - 10,
          }}
        >
          {/* Publisher */}
          <div className="mb-3 font-semibold text-white">
            {hovered.point.publisher}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Target</span>
              <span className="font-medium text-white">
                {hovered.point.y.toFixed(2)}
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
                  hovered.point.upside != null && hovered.point.upside >= 0
                    ? "font-semibold text-emerald-400"
                    : "font-semibold text-red-400"
                }
              >
                {hovered.point.upside != null
                  ? `${hovered.point.upside >= 0 ? "+" : ""}${hovered.point.upside.toFixed(1)}%`
                  : "—"}
              </span>
            </div>
          </div>

          {/* Ratings */}
          <div className="mt-3 border-t border-slate-800 pt-3 space-y-1.5">
            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Rating</span>
              <span className="font-medium text-white">
                {hovered.point.rating ?? "—"}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Previous</span>
              <span className="text-slate-300">
                {hovered.point.prev_rating ?? "—"}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Action</span>
              <span className="font-medium text-white">
                {hovered.point.action ?? "—"}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="mt-3 border-t border-slate-800 pt-2 text-slate-500">
            Published {hovered.point.prediction_date}
          </div>
        </div>
      )}
    </div>
  );
}