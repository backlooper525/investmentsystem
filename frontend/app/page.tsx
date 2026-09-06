import Link from 'next/link';
import {
  Search,
  ShieldCheck,
  Sparkles,
  ClipboardEdit,
  LineChart,
  CalendarClock,
  BarChart2,
  LayoutDashboard,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

const loopSteps = [
  {
    icon: ClipboardEdit,
    title: 'Record a prediction',
    body: "Log a price target before the outcome is known - manually, or pulled automatically from analyst research.",
  },
  {
    icon: CalendarClock,
    title: 'Wait for maturity',
    body: 'Nothing is touched while the forecast horizon plays out. The record is set the moment it is entered.',
  },
  {
    icon: LineChart,
    title: 'Fetch the real price',
    body: 'When the forecast matures, the actual market price is pulled in and stored alongside it - permanently.',
  },
  {
    icon: BarChart2,
    title: 'Measure who was right',
    body: 'Forecast vs. reality, broken down by source, method, and horizon - a track record you can actually trust.',
  },
];

const features = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    title: 'Watchlist',
    body: 'Add tickers and pull in sell-side research and analyst price targets, visualized against the real price history - the full picture of what analysts think of your stocks, in one chart.',
  },
  {
    href: '/new-entry',
    icon: PlusCircle,
    title: 'New Entry',
    body: 'Manually log your own prediction - price target, method, and forecast horizon - before the outcome is known.',
  },
  {
    href: '/analytics',
    icon: BarChart2,
    title: 'Analytics',
    body: 'See forecast accuracy broken down by source, method, and time horizon once outcomes are in.',
  },
  {
    href: '/dashboard',
    icon: Sparkles,
    title: 'AI Analyst',
    body: 'Ask questions about your watchlist straight from the dashboard - available from the ✦ button in the corner.',
  },
];

export default function IntroPage() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <div className="flex flex-col items-center gap-5 py-14 text-center">
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-xs font-medium text-slate-400">
          <ShieldCheck size={14} className="text-blue-400" />
          Record first. Measure later. No adjustments.
        </div>

        <h1 className="hero-title text-4xl font-bold tracking-tight sm:text-5xl">
          Track investment predictions.
          <br />
          Find out who was actually right.
        </h1>

        <p className="max-w-2xl text-base text-slate-400 sm:text-lg">
          A platform for logging investment ideas and their price predictions before
          the outcome is known, then measuring whether they came true - so you know
          which sources, methods, and analysts are genuinely worth listening to.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="cta-btn group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:scale-105"
          >
            Open Watchlist
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/new-entry"
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
          >
            Log a prediction
          </Link>
        </div>

        <style>{`
          .hero-title {
            background: linear-gradient(120deg, #ffffff, #93c5fd, #ffffff);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: hero-shift 6s ease infinite;
          }
          @keyframes hero-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .cta-btn {
            background: linear-gradient(120deg, #2563eb, #7c3aed, #2563eb);
            background-size: 200% 200%;
            animation: cta-gradient 4s ease infinite;
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.35);
          }
          @keyframes cta-gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="mb-1 text-center text-xl font-semibold text-white">How it works</h2>
        <p className="mb-8 text-center text-sm text-slate-500">
          The same four-step loop runs behind every prediction in the system.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loopSteps.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="relative rounded-xl border border-slate-700 bg-slate-900 p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
                  <Icon size={18} />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-white">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="mb-1 text-center text-xl font-semibold text-white">What you can do here</h2>
        <p className="mb-8 text-center text-sm text-slate-500">
          Jump straight into any part of the system.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map(({ href, icon: Icon, title, body }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-blue-600/60 hover:bg-slate-800/60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{body}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Why */}
      <div className="mb-16 flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
          <Search size={16} />
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold text-white">Why this exists</h3>
          <p className="text-xs leading-relaxed text-slate-400">
            Most prediction tracking either suffers from survivorship bias, gets
            retrofitted to historical data, or never gets systematically measured
            at all. This system records forecasts before outcomes are known and
            never rewrites the historical record — so the accuracy numbers it
            produces are actually earned.
          </p>
        </div>
      </div>
    </div>
  );
}
