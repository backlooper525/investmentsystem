# Investment Prediction & Learning System

A platform for tracking investment ideas and their price predictions and measuring whether they actually come true.

The idea is to record a prediction before the outcome is known, collect the real market price when the forecast period ends, and build up a track record over time. The goal is to find out which sources, methods, and analysts are genuinely worth listening to - not in hindsight, but measured against predictions made under uncertainty.

---

## Features

**Prediction intake**
- Manual entry via web UI
- Automated collection of analyst price targets and research reports
- Every prediction is tagged with its source, method, and forecast horizon

**Data pipeline**
- Automated research retrieval and search
- LLM-assisted extraction and synthesis of investment content
- Scheduled jobs handle the ongoing collection and processing

**Outcome tracking**
- Market prices fetched automatically at forecast maturity
- Forecasted vs. realised results stored persistently
- Nothing gets rewritten - the historical record is immutable

**Analytics**
- Forecast accuracy comparisons
- Performance breakdowns by source, method, and time horizon
- Dashboard for exploring results

---

## Stack

| | |
|---|---|
| Backend | FastAPI + Python |
| Frontend | Next.js |
| Database | MySQL |
| AI | OpenAI, Anthropic, Google Gemini |
| Market data | yfinance |
| Search | Serper API |
| Infra | Docker + Docker Compose |

---

## Architecture

The MVP is built around eight modules:

- **Search & Fetch** - pulls investment research and analyst targets
- **Audit** - validates incoming data before it enters the pipeline
- **Extraction & Synthesis** - LLM-based parsing of research content
- **Forecast Entry** - handles both manual and automated prediction intake
- **Realised Data Collection** - fetches market prices at maturity
- **Scheduler** - keeps everything running on time
- **Comparison & Analytics** - where forecasts meet outcomes
- **Dashboard** - exploration and reporting UI

Everything runs in Docker and shares a single relational database that's designed around maintaining a clean chain of provenance from prediction to outcome.

---

## Goal

The MVP exists to gather and track investment ideas, accumulate a dataset of forecast-outcome pairs that's actually worth analysing.

Most prediction tracking either suffers from survivorship bias, gets retrofitted to historical data, or never gets systematically measured at all. This is an attempt to do it properly — record first, measure later, no adjustments.

Once there's enough data, the plan is to use it to evaluate forecasting approaches more rigorously and explore where machine learning might add something meaningful.

Dashboard page
<img width="2496" height="639" alt="image" src="https://github.com/user-attachments/assets/b16cc9f8-c3c3-4741-8149-80620b598671" />

Manual entry page
<img width="923" height="1197" alt="image" src="https://github.com/user-attachments/assets/a3123d8e-ebba-4040-a615-009341d62d0a" />

Analytics page
<img width="2155" height="1031" alt="image" src="https://github.com/user-attachments/assets/df42be36-e08e-4a66-bdc7-259aa8708a6d" />

