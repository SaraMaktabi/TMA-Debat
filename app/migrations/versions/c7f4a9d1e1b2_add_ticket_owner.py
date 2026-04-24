"""add_ticket_owner

Revision ID: c7f4a9d1e1b2
Revises: 2e4540967efc
Create Date: 2026-04-24 16:40:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c7f4a9d1e1b2"
down_revision: Union[str, Sequence[str], None] = "2e4540967efc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tickets", sa.Column("created_by_user_id", sa.UUID(), nullable=True))


def downgrade() -> None:
    op.drop_column("tickets", "created_by_user_id")
