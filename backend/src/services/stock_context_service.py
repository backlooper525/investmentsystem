from __future__ import annotations

import re

from sqlmodel import Session

from src.repositories.forecast_repository import forecast_repository
from src.repositories.instrument_repository import instrument_repository
from src.repositories.price_repository import price_repository

_WORD_PATTERN = re.compile(r"\b[A-Za-z]{1,10}\b")

# No tokenizer dependency for this — ~4 characters per token is the standard
# rough estimate for English text and is good enough for a soft budget.
_CHARS_PER_TOKEN = 4

_MAX_TICKERS = 3


def _estimate_tokens(text: str) -> int:
    return max(1, len(text) // _CHARS_PER_TOKEN)


def extract_tickers(session: Session, message: str) -> list[str]:
    """Finds words in the message that match a known instrument ticker."""
    candidates = {w.upper() for w in _WORD_PATTERN.findall(message)}
    if not candidates:
        return []

    matches = instrument_repository.get_by_tickers(session, list(candidates))
    return [i.ticker for i in matches][:_MAX_TICKERS]


def _forecast_line(f) -> str:
    publisher_name = f.publisher.institution if f.publisher else "Unknown"
    price_part = f"{f.predicted_price} {f.currency}" if f.predicted_price else "no target"
    return (
        f"- {f.prediction_date} | {publisher_name} | {price_part} | "
        f"rating: {f.rating or '—'} (prev: {f.prev_rating or '—'}) | action: {f.action or '—'}"
    )


def _build_ticker_block(session: Session, ticker: str, token_budget: int) -> str | None:
    instrument = instrument_repository.get_by_ticker(session, ticker)
    if not instrument:
        return None

    forecasts = forecast_repository.get_by_instrument(session, instrument.id)

    header = [f"=== {instrument.ticker} forecast data ({len(forecasts)} total) ==="]

    latest_price = price_repository.get_latest(session, instrument.id)
    if latest_price:
        header.append(
            f"Last close: {latest_price.price} {latest_price.currency} ({latest_price.price_date})"
        )

    if not forecasts:
        header.append("No forecasts recorded yet for this ticker.")
        return "\n".join(header)

    priced = [f for f in forecasts if f.predicted_price and f.predicted_price > 0]
    if priced:
        highest = max(priced, key=lambda f: f.predicted_price)
        lowest = min(priced, key=lambda f: f.predicted_price)
        avg = sum(float(f.predicted_price) for f in priced) / len(priced)

        highest_publisher = highest.publisher.institution if highest.publisher else "Unknown"
        lowest_publisher = lowest.publisher.institution if lowest.publisher else "Unknown"

        header.append(
            f"Highest target: {highest.predicted_price} {highest.currency} by "
            f"{highest_publisher} ({highest.prediction_date}, rating: {highest.rating or '—'})"
        )
        header.append(
            f"Lowest target: {lowest.predicted_price} {lowest.currency} by "
            f"{lowest_publisher} ({lowest.prediction_date}, rating: {lowest.rating or '—'})"
        )
        header.append(f"Average target: {avg:.2f} {instrument.currency}")

    header.append("Individual forecasts (most recent first):")
    header_block = "\n".join(header)

    detail_budget = token_budget - _estimate_tokens(header_block)
    detail_lines: list[str] = []
    used_tokens = 0
    omitted = 0

    for f in forecasts:
        line = _forecast_line(f)
        line_tokens = _estimate_tokens(line) + 1
        if used_tokens + line_tokens > detail_budget:
            omitted += 1
            continue
        detail_lines.append(line)
        used_tokens += line_tokens

    if omitted:
        detail_lines.append(f"... ({omitted} more forecasts omitted for brevity)")

    return header_block + "\n" + "\n".join(detail_lines)


def build_stock_context(session: Session, tickers: list[str], max_tokens: int = 6000) -> str | None:
    """
    Builds a token-budgeted summary of forecast data for the given tickers:
    who made each forecast, price targets, ratings, and aggregate stats.

    max_tokens caps the whole returned string (approximate, chars/4 based),
    split evenly across tickers. Returns None if nothing resolves.
    """
    if not tickers:
        return None

    per_ticker_budget = max_tokens // len(tickers)
    blocks: list[str] = []
    remaining = max_tokens

    for ticker in tickers:
        if remaining <= 0:
            break

        block = _build_ticker_block(session, ticker, min(per_ticker_budget, remaining))
        if block is None:
            continue

        blocks.append(block)
        remaining -= _estimate_tokens(block)

    return "\n\n".join(blocks) if blocks else None
