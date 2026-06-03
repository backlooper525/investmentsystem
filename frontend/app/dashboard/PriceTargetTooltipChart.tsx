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

interface Props {
  forecasts: Forecast[];
  publishers: Publisher[];
  currentPrice?: number | null;
}

export default function PriceTargetTooltipChart({
  forecasts,
  publishers,
  currentPrice,
}: Props) {
  const data = forecasts
  .filter((f) => f.predicted_price > 0 && f.maturation_date)
  .map((f) => ({
    x: new Date(f.maturation_date!).getTime(),
    y: f.predicted_price,
    prediction_date: f.prediction_date,
    publisher:
      publishers.find((p) => p.id === f.publisher_id)?.institution ??
      "Unknown",
  }))
  .sort((a, b) => a.x - b.x);


    const prices = forecasts
    .map(f => f.predicted_price)
    .filter((p): p is number => p != null && p > 0);

    const current = currentPrice ?? 0;

    const minForecast = prices.length ? Math.min(...prices) : current;
    const maxForecast = prices.length ? Math.max(...prices) : current;

    const referenceMin = Math.min(minForecast, current);

    const buffer = referenceMin * 0.05;

    const yMin = Math.max(0, referenceMin - buffer);
    const yMax = maxForecast * 1.05;


  return (
    <div className="w-[600px] h-[320px]">
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

          {currentPrice && (
            <ReferenceLine
              y={currentPrice}
              stroke="#f59e0b"
              label="Current"
            />
          )}

          <Tooltip
            formatter={(value: any) => value}
            labelFormatter={(value) => String(value)}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const d = payload[0].payload;

              return (
                <div className="rounded border border-slate-700 bg-slate-900 p-3 text-xs">
                  <div className="font-semibold text-white">
                    {d.publisher}
                  </div>

                  <div className="text-slate-300">
                    Target: {d.y}
                  </div>

                  <div className="text-slate-400">
                    Matures: {new Date(d.x).toISOString().slice(0, 10)}
                  </div>

                  <div className="text-slate-400">
                    Predicted: {d.prediction_date}
                  </div>
                </div>
              );
            }}
          />

          <Scatter data={data} fill="#60a5fa" dataKey="y">
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