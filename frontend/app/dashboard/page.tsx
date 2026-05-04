import { apiFetch } from '@/lib/api';
import InstrumentsTable from './instrumentstable';

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
  price_date: string | null;
  price: number;
  currency: string | null;
  data_source: string | null;
}

export default async function DashboardPage() {
  //const instruments = await apiFetch<Instrument[]>('/instruments');

  const [instruments, sources, forecasts, forecastAggregates, publishers, prices] = await Promise.all([
    apiFetch<Instrument[]>('/instruments'),
    apiFetch<Source[]>('/sources'),
    apiFetch<Forecasts[]>('/forecasts'),
    apiFetch<Forecast_aggregates[]>('/forecasts/aggregates/all'),
    apiFetch<Publishers[]>('/publishers'),
    apiFetch<Price[]>('/ingest/prices/all'),
  ]);


  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Dashboard</h1>
      <InstrumentsTable instruments={instruments} sources={sources} forecasts={forecasts} forecast_ag={forecastAggregates} publishers={publishers} lastclose={prices} />
    </div>
  )
}
