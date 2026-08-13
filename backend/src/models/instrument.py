from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .forecast import Forecast
    from .forecast_aggregate import ForecastAggregate
    from .instrument_class import InstrumentClass
    from .price import Price


class Instrument(SQLModel, table=True):
    __tablename__ = "instruments"

    id: int | None = Field(default=None, primary_key=True)
    class_id: int = Field(foreign_key="instrument_classes.id", index=True)
    ticker: str = Field(max_length=20, unique=True)
    name: str = Field(max_length=255, index=True)
    currency: str = Field(max_length=10)

    instrument_class: Optional["InstrumentClass"] = Relationship(back_populates="instruments")
    prices: list["Price"] = Relationship(back_populates="instrument", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


    forecasts: list["Forecast"] = Relationship(
        back_populates="instrument",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    forecast_aggregates: list["ForecastAggregate"] = Relationship(
        back_populates="instrument",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class InstrumentCreate(SQLModel):
    ticker: str
