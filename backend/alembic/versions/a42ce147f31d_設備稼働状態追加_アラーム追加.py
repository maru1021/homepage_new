"""設備稼働状態追加,アラーム追加

Revision ID: a42ce147f31d
Revises: 73b84e5ea4fa
Create Date: 2025-05-31 12:01:57.458682

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a42ce147f31d'
down_revision: Union[str, None] = '73b84e5ea4fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('alarm_histories', sa.Column('stop_time', sa.DateTime(), nullable=True))
    op.add_column('alarm_histories', sa.Column('restart_time', sa.DateTime(), nullable=True))
    op.add_column('alarm_histories', sa.Column('line_id', sa.Integer(), nullable=True))
    op.add_column('alarm_histories', sa.Column('tool_no_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'alarm_histories', 'tool_nos', ['tool_no_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key(None, 'alarm_histories', 'lines', ['line_id'], ['id'], ondelete='CASCADE')
    op.drop_column('alarm_histories', 'register_date')
    op.add_column('alarms', sa.Column('name', sa.String(length=50), nullable=True))
    op.add_column('alarms', sa.Column('active', sa.Boolean(), nullable=True))
    op.add_column('alarms', sa.Column('sort', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_alarms_name'), 'alarms', ['name'], unique=False)
    op.drop_constraint('alarms_machine_id_fkey', 'alarms', type_='foreignkey')
    op.drop_column('alarms', 'machine_id')
    op.add_column('machines', sa.Column('operating_condition', sa.String(length=10), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('machines', 'operating_condition')
    op.add_column('alarms', sa.Column('machine_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('alarms_machine_id_fkey', 'alarms', 'machines', ['machine_id'], ['id'], ondelete='CASCADE')
    op.drop_index(op.f('ix_alarms_name'), table_name='alarms')
    op.drop_column('alarms', 'sort')
    op.drop_column('alarms', 'active')
    op.drop_column('alarms', 'name')
    op.add_column('alarm_histories', sa.Column('register_date', postgresql.TIMESTAMP(), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'alarm_histories', type_='foreignkey')
    op.drop_constraint(None, 'alarm_histories', type_='foreignkey')
    op.drop_column('alarm_histories', 'tool_no_id')
    op.drop_column('alarm_histories', 'line_id')
    op.drop_column('alarm_histories', 'restart_time')
    op.drop_column('alarm_histories', 'stop_time')
    # ### end Alembic commands ###
