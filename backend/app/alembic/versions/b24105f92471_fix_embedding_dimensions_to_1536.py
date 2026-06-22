"""fix embedding dimensions to 1536

Revision ID: b24105f92471
Revises: f1fc639d5987
Create Date: 2026-06-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = 'b24105f92471'
down_revision: Union[str, None] = 'f1fc639d5987'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('documents', 'embedding')
    op.add_column('documents', sa.Column('embedding', Vector(1536), nullable=True))


def downgrade() -> None:
    op.drop_column('documents', 'embedding')
    op.add_column('documents', sa.Column('embedding', Vector(768), nullable=True))