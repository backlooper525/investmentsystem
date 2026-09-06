from __future__ import annotations

from sqlmodel import Session, select

from src.models.instrument import Instrument


class InstrumentRepository:
    def list(self, session: Session) -> list[Instrument]:
        return list(session.exec(select(Instrument)).all())

    def list_by_class(self, session: Session, class_id: int) -> list[Instrument]:
        return list(session.exec(select(Instrument).where(Instrument.class_id == class_id)).all())

    def get(self, session: Session, instrument_id: int) -> Instrument | None:
        return session.get(Instrument, instrument_id)

    def get_by_ticker(self, session: Session, ticker: str) -> Instrument | None:
        return session.exec(select(Instrument).where(Instrument.ticker == ticker)).first()

    def get_by_tickers(self, session: Session, tickers: list[str]) -> list[Instrument]:
        if not tickers:
            return []
        upper_tickers = [t.upper() for t in tickers]
        return list(
            session.exec(select(Instrument).where(Instrument.ticker.in_(upper_tickers))).all()
        )

    def delete(self, session: Session, instrument_id: int) -> bool:
        instrument = session.get(Instrument, instrument_id)
        if not instrument:
            return False
        session.delete(instrument)
        session.commit()
        return True

    def create(self, session: Session, instrument_data: InstrumentCreate) -> Instrument:
        instrument = Instrument(
            ticker=instrument_data.ticker.upper(),
            name=instrument_data.ticker,
            currency="USD",
            class_id=1
        )

        session.add(instrument)
        session.commit()
        session.refresh(instrument)
        return instrument

instrument_repository = InstrumentRepository()
