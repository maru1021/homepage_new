"""BulletinImageモデル追加

Revision ID: 37e83ad3bd65
Revises: e2a4d553f1d1
Create Date: 2025-03-22 05:25:34.065677

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '37e83ad3bd65'
down_revision: Union[str, None] = 'e2a4d553f1d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
