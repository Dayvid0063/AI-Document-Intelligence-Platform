"""add embedding column to documents

Revision ID: 4d1a0288b6e1
Revises: 94f5137b8c56
Create Date: 2026-06-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = '4d1a0288b6e1'
down_revision: Union[str, None] = '94f5137b8c56'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.add_column('documents', sa.Column('embedding', Vector(1024), nullable=True))


def downgrade() -> None:
    op.drop_column('documents', 'embedding')