'use client';

import { useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { clientApiFetch } from '@/lib/api';
import PriceTargetTooltipChart from "./PriceTargetTooltipChart";

interface Instrument {
  id: number;
  ticker: string;
  name: string;
  currency: string;
  class_id: number;
}

interface Source {
  id: number;
  publisher_id: number | null;
  title: string | null;
  file_path: string | null;
  snippet_text: string | null;
  search_subjects: string[] | null;
}

interface Forecasts {
  id: number;
  instrument_id: number | null;
  publisher_id: number | null;
  prediction_date: string | null;
  maturation_date: string | null;
  predicted_price: number;
  method: string | null;
  entry_mode: string | null;
  estimate_type: string | null;
  rating: string | null;
  prev_rating: string | null;
  action: string | null;
}

interface Forecast_aggregates {
  id: number;
  instrument_id: number | null;
  publisher_id: number | null;
  prediction_date: string | null;
  maturation_date: string | null;
  predicted_price: number;
  estimate_type: string | null;
}

interface Publishers {
  id: number;
  title: string | null;
  institution: string | null;
}

interface Price {
  instrument_id: number | null;
  price_date: string | null;     // ISO date (YYYY-MM-DD)
  price: number;
  currency: string | null;
  data_source: string | null;
}

interface Props {
  instruments: Instrument[];
  sources: Source[];
  forecasts: Forecasts[];
  forecast_ag: Forecast_aggregates[];
  publishers: Publishers[];
  lastclose: Price[];
}

const formatPrice = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);


function ExpandedForecastRows({ forecasts, currency, publishers }: {
  forecasts: Forecasts[],
  currency: string,
  publishers: Publishers[],
}) {
  return (
    <>
      {forecasts.map(f => (
        <tr key={`forecast-${f.id}`} className="bg-slate-800">
          <td />
          <td className="px-5 py-2 text-slate-400">{formatPrice(f.predicted_price, currency)}</td>
          <td className="whitespace-nowrap px-5 py-2 text-slate-400">{f.prediction_date ?? '—'}</td>
          <td className="px-5 py-2 text-slate-400">{f.rating ?? '—'}</td>
          <td className="px-5 py-2 text-slate-400">{f.action ?? '—'}</td>

          <td className="px-5 py-2 text-slate-400">
            {f.entry_mode === 'aggregate'
              ? <span className="text-yellow-500 italic">aggregate</span>
              : f.publisher_id
                ? publishers.find(p => p.id === f.publisher_id)?.institution ?? '—'
                : '—'}
          </td>
          <td /><td /><td />
        </tr>
      ))}
    </>
  );
}

function ExpandedSourceRows({ sources }: { sources: Source[] }) {
  return sources.map(s => (
    <tr key={s.id} className="bg-slate-800">
      <td /><td /><td /><td /><td /><td /><td />
      <td className="px-5 py-2 text-slate-400">
        {s.file_path ? (
          <a href={s.file_path} target="_blank" className="hover:underline text-blue-400">
            {s.title ?? s.file_path}
          </a>
        ) : (s.title ?? '—')}
      </td>
    </tr>
  ));
}

export default function InstrumentsTable({ instruments, sources, forecasts, publishers, forecast_ag, lastclose }: Props) {
  const [expandedSourceId, setExpandedSourceId] = useState<number | null>(null);
  const [expandedForecastId, setExpandedForecastId] = useState<number | null>(null);
  const [openChartId, setOpenChartId] = useState<number | null>(null);

  const [newTicker, setNewTicker] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [methodFilter, setMethodFilter] = useState<'all' | 'sellside' | 'llm'| 'scenario' | 'manual'| 'average'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('all');
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const getMethodType = (method?: string | null) => {
    if (!method) return 'unknown';
    const m = method.toLowerCase();
    if (m.includes('llm')) return 'llm';
    if (m.includes('manual')) return 'manual';
    if (m.includes('source_point_estimate')) return 'sellside';
    if (m.includes('source_scenario_estimate')) return 'scenario';
    if (m.includes('averaged_point_estimate')) return 'average';
    return "-";
  };

  const filteredInstruments = instruments.filter((instrument) => {
    if (statusFilter === 'all') return true;

    // Active = at least one forecast with maturation_date > today
    return forecasts.some(
      (f) =>
        f.instrument_id === instrument.id &&
        f.maturation_date != null &&
        f.maturation_date > today
    );
  });



  const [fetchTicker, setFetchTicker] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  async function handleFetchTicker() {
    if (!fetchTicker) return;
    setIsFetching(true);
    try {
      await clientApiFetch(`/fetch/${fetchTicker}`, { method: 'GET' });
      router.refresh(); // refreshes server component data
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
      setFetchTicker('');
    }
  }

  async function handleFetchForecasts(ticker) {
    if (!ticker) return;

    setIsFetching(true);
    try {
      await clientApiFetch(`/forecasts/${ticker}`, {
        method: 'GET',
      });

      router.refresh(); // reload DB data
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
      setFetchTicker('');
    }
  }

  async function handlePredictForecasts() {
    if (!fetchTicker) return;

    setIsFetching(true);
    try {
      await clientApiFetch(`/forecasts/predict/${fetchTicker}`, {
        method: 'POST',
      });

      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
      setFetchTicker('');
    }
  }


  async function handleLastClosePrice() {
    setIsFetching(true);
    try {
      await clientApiFetch(`/ingest/lastprices`, {
        method: 'POST',
      });

      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
      setFetchTicker('');
    }
  }

// ADD instrument
  async function handleAddInstrument() {
  if (!newTicker) return;
    setIsAdding(true);
    try {
      await clientApiFetch("/instruments", {
        method: "POST",
        body: JSON.stringify({
          ticker: newTicker,
        }),
      });

      await handleFetchForecasts(newTicker);

      setNewTicker("");
      router.refresh(); // reload table data
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  }

  // DELETE instrument
  async function handleDeleteInstrument(id: number) {
    if (!confirm("Remove this ticker from the watchlist?")) return;

    try {
      await clientApiFetch(`/instruments/${id}`, {
        method: "DELETE",
      });

      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }



  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectedInst = instruments.find((i) => i?.ticker === fetchTicker);

  return (
    <div className="h-[calc(95vh-220px)] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900">

      {/* Header + filters */}
      <div className="sticky top-0 z-20 bg-slate-900 border-b border-slate-700">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Instruments</h2>
            <p className="mt-0.5 text-xs text-slate-400">{filteredInstruments.length} tracked</p>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active')}
            className="text-sm border border-slate-700 rounded-md px-2 py-1 bg-slate-800 text-slate-300"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
          </select>




          <div className="flex gap-2 items-center">
            <input
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              placeholder="Add ticker"
              className="text-sm px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white w-20"
            />

            <button
              onClick={handleAddInstrument}
              disabled={isAdding || !newTicker}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-500 disabled:opacity-50"
            >
              +
            </button>
          </div>






          <div className="w-3" />
          <p className="text-xs text-slate-400">Estimate type</p>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="text-sm border border-slate-700 rounded-md px-2 py-1 bg-slate-800 text-slate-300"
          >
            <option value="all">All</option>
            <option value="sellside">Sellside</option>
            <option value="llm">LLM</option>
            <option value="scenario">Scenario</option>
            <option value="manual">Manual</option>
            <option value="average">Average</option>
          </select>

          <div className="w-3" />
          <div className="w-3" />


          <div className="relative w-20">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`text-sm border border-slate-700 rounded-md px-2 py-1 bg-slate-800 w-full font-mono text-left
                ${!selectedInst ? "text-slate-500" : "text-slate-300"}`}
            >
              {selectedInst ? selectedInst.ticker.toUpperCase() : "TICKER"}
            </button>
            {dropdownOpen && (
              <ul className="absolute z-10 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                {instruments
                  .filter((i) => i?.ticker)
                  .map((inst) => (
                    <li
                      key={inst.id}
                      onClick={() => {
                        setFetchTicker(inst.ticker.toUpperCase());
                        setDropdownOpen(false);
                      }}
                      className={`px-3 py-1.5 text-sm font-mono cursor-pointer hover:bg-slate-700 flex gap-3
                        ${inst.ticker === fetchTicker ? "text-white" : "text-slate-100"}`}
                    >
                      <span>{inst.ticker.toUpperCase()}</span>
                      <span className="text-slate-500">{inst.name}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>


          <button
            onClick={() => handleFetchForecasts(fetchTicker)}
            disabled={isFetching || !fetchTicker}
            className="text-sm flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'Fetching…' : 'Targets'}
          </button>

          <button
            onClick={handleFetchTicker}
            disabled={isFetching || !fetchTicker}
            className="text-sm flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'Fetching…' : 'Research'}
          </button>

          <button
            onClick={handlePredictForecasts}
            disabled={isFetching || !fetchTicker}
            className="text-sm flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'Running…' : 'Predict'}
          </button>

          <div className="w-3" />
          <div className="w-3" />
          <div className="w-3" />

          <button
            onClick={handleLastClosePrice}
            className="text-sm flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'Running…' : 'Prices'}
          </button>



        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="sticky top-[70px] z-10 bg-slate-800">
          <tr className="border-b border-slate-700 bg-slate-800">
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Stock
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Price target</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Rating</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Action</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Publisher</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Bull • Bear case</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Research</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-700">
          {filteredInstruments.map((instrument) => {

            const latestClose = lastclose.find(
              p => p.instrument_id === instrument.id
            );

            const instrumentSources = sources.filter(s =>
              s.search_subjects?.includes(instrument.ticker)
            );



            const filteredForecasts = forecasts.filter(f => {
              if (f.instrument_id !== instrument.id) return false;
              if (methodFilter === 'all') return true;
              return getMethodType(f.estimate_type) === methodFilter;
            });

            // keep only latest forecast per publisher
            const latestByPublisher = Object.values(
              filteredForecasts.reduce((acc, f) => {
                const key = f.publisher_id ?? 'no-publisher';

                if (!acc[key]) {
                  acc[key] = f;
                } else {
                  const existingDate = acc[key].prediction_date ?? '';
                  const newDate = f.prediction_date ?? '';

                  if (newDate > existingDate) {
                    acc[key] = f;
                  }
                }

                return acc;
              }, {} as Record<string | number, Forecasts>)
            );



            //sort
            const sortedForecasts = latestByPublisher.sort((a, b) =>
              (b.prediction_date ?? '').localeCompare(a.prediction_date ?? '')
            );

            const instrumentAggregates = forecast_ag.filter(a =>
              a.instrument_id === instrument.id &&
              (methodFilter === 'all' || getMethodType(a.estimate_type) === methodFilter)
            );


            // combine forecasts and aggregates into one list
            const combined = [
              ...sortedForecasts,
              ...instrumentAggregates.map(a => ({
                id: a.id + 100000, // avoid id collision
                instrument_id: a.instrument_id,
                publisher_id: null,
                prediction_date: a.prediction_date,
                maturation_date: a.maturation_date,
                predicted_price: a.predicted_price,
                method: null,
                entry_mode: 'aggregate',
                rating: a.rating,
              } as Forecasts))
            ];

            const latestForecast = combined[0];
            const restForecasts = combined.slice(1);






            const prices = sortedForecasts.map(f => f.predicted_price);
            const bullPrice = prices.length ? Math.max(...prices) : null;

            //const bearPrice = prices.length ? Math.min(...prices) : null;
            const nonZeroPrices = prices.filter(p => p > 0);
            const bearPrice = nonZeroPrices.length
              ? Math.min(...nonZeroPrices)
              : (prices.length ? Math.min(...prices) : null);


            const isForecastExpanded = expandedForecastId === instrument.id;
            const isSourceExpanded = expandedSourceId === instrument.id;

            return (
              <React.Fragment key={instrument.id}>
                <tr className="hover:bg-slate-800/50">

                  {/* Ticker */}
                  <td className="px-5 py-3">
                    <div className="font-mono text-blue-400">{instrument.ticker}</div>
                    <div className="text-[10px] text-slate-500">{instrument.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {(() => {
                        const latest = lastclose
                          .filter(p => p.instrument_id === instrument.id)
                          .sort((a, b) => (b.price_date ?? '').localeCompare(a.price_date ?? ''))[0];
                        return latest ? (
                          <span><span className="text-slate-600">Last close: </span>{formatPrice(latest.price, instrument.currency)}</span>
                        ) : '—';
                      })()}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3 text-slate-200">
                    {latestForecast ? formatPrice(latestForecast.predicted_price, instrument.currency) : '—'}
                    {restForecasts.length > 0 && (
                      <button
                        onClick={() => setExpandedForecastId(isForecastExpanded ? null : instrument.id)}
                        className="ml-2 text-xs text-blue-400 hover:text-blue-300"
                      >
                        {isForecastExpanded ? 'hide' : `+${restForecasts.length }`}
                      </button>
                    )}
                  </td>

                  {/* Date */}
                  <td className="whitespace-nowrap px-5 py-3 text-slate-400">
                    {latestForecast?.prediction_date ?? '—'}
                  </td>

                  {/* Rating */}
                  <td className="px-5 py-3 text-slate-400">
                    {latestForecast?.rating ?? '—'}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3 text-slate-400">
                    {latestForecast?.action ?? '—'}
                  </td>


                  {/* Publisher */}
                  <td className="px-5 py-3 text-slate-400">
                    {latestForecast?.entry_mode === 'aggregate'
                      ? <span className="text-yellow-500 italic">aggregate</span>
                      : latestForecast?.publisher_id
                        ? publishers.find(p => p.id === latestForecast.publisher_id)?.institution ?? '—'
                        : '—'}
                  </td>

                  {/* Bull / Bear */}
                  <td className="px-5 py-3">
                    {bullPrice !== null && bearPrice !== null ? (
                      <div className="relative flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-green-400">
                            {formatPrice(bullPrice, instrument.currency)}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-red-400">
                            {formatPrice(bearPrice, instrument.currency)}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            setOpenChartId(
                              openChartId === instrument.id ? null : instrument.id
                            )
                          }
                          className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          Chart
                        </button>
                        {openChartId === instrument.id && (
                          <div className="absolute right-0 top-6 z-50">
                            <div className="relative rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
                              <button
                                onClick={() => setOpenChartId(null)}
                                className="absolute right-2 top-2 text-slate-400 hover:text-white"
                              >
                                ×
                              </button>

                              <PriceTargetTooltipChart
                                forecasts={sortedForecasts}
                                publishers={publishers}
                                currentPrice={latestClose?.price}
                                ticker={instrument.ticker}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>


                  {/* Research */}
                  <td className="px-5 py-3 text-slate-400">
                    {instrumentSources[0] ? (
                      instrumentSources[0].file_path ? (
                        <a href={instrumentSources[0].file_path} target="_blank" className="hover:underline text-blue-400">
                          {instrumentSources[0].title ?? instrumentSources[0].file_path}
                        </a>
                      ) : (instrumentSources[0].title ?? '—')
                    ) : '—'}
                    {instrumentSources.length > 1 && (
                      <button
                        onClick={() => setExpandedSourceId(isSourceExpanded ? null : instrument.id)}
                        className="ml-2 text-xs text-blue-400 hover:text-blue-300"
                      >
                        {isSourceExpanded ? 'hide' : `+${instrumentSources.length - 1}`}
                      </button>
                    )}
                  </td>


                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDeleteInstrument(instrument.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </td>

                </tr>


                {/* Expanded forecasts */}
                {isForecastExpanded && <ExpandedForecastRows
                  forecasts={restForecasts}
                  currency={instrument.currency}
                  publishers={publishers}

                />}

                {/* Expanded sources */}
                {isSourceExpanded && <ExpandedSourceRows sources={instrumentSources.slice(1)} />}

              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}