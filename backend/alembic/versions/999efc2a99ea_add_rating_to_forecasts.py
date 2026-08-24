"""add rating to forecasts

Revision ID: 999efc2a99ea
Revises: e2f3a4b5c6d7
Create Date: 2026-08-14 01:21:19.355260

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '999efc2a99ea'
down_revision: Union[str, Sequence[str], None] = 'e2f3a4b5c6d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "forecasts",
        sa.Column("rating", sa.String(length=20), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("forecasts", "rating")
