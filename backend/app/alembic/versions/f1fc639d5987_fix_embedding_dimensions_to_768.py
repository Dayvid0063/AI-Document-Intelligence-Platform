"""fix embedding dimensions to 768

Revision ID: f1fc639d5987
Revises: 4d1a0288b6e1
Create Date: 2026-06-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = 'f1fc639d5987'
down_revision: Union[str, None] = '4d1a0288b6e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('documents', 'embedding')
    op.add_column('documents', sa.Column('embedding', Vector(768), nullable=True))


def downgrade() -> None:
    op.drop_column('documents', 'embedding')
    op.add_column('documents', sa.Column('embedding', Vector(1024), nullable=True))