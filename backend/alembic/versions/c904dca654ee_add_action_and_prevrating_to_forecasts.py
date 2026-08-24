"""add action and prevrating to forecasts

Revision ID: c904dca654ee
Revises: 999efc2a99ea
Create Date: 2026-08-17 22:20:50.512719

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c904dca654ee'
down_revision: Union[str, Sequence[str], None] = '999efc2a99ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "forecasts",
        sa.Column("prev_rating", sa.String(length=20), nullable=True),
    )

    op.add_column(
        "forecasts",
        sa.Column("action", sa.String(length=20), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("forecasts", "action")
    op.drop_column("forecasts", "prev_rating")


