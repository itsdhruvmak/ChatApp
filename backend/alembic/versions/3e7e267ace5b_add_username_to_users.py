"""add username to users

Revision ID: 3e7e267ace5b
Revises: e7f0d7e4f990
Create Date: 2026-08-25 16:10:52.539768

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e7e267ace5b'
down_revision: Union[str, Sequence[str], None] = 'e7f0d7e4f990'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "username",
            sa.String(length=50),
            nullable=True
        )
    )

    op.execute(
        "UPDATE users SET username = 'user_' || id"
    )

    op.alter_column(
        "users",
        "username",
        nullable=False
    )

    op.create_unique_constraint(
        "uq_users_username",
        "users",
        ["username"]
    )

    op.create_index(
        "ix_users_username",
        "users",
        ["username"],
        unique=False
    )

def downgrade() -> None:
    op.drop_index(
        "ix_users_username",
        table_name="users"
    )

    op.drop_constraint(
        "uq_users_username",
        "users",
        type_="unique"
    )

    op.drop_column(
        "users",
        "username"
    )
