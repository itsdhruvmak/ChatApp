from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class ChatMember(Base):
    __tablename__= "chat_member"

    __table_args__=(
        UniqueConstraint(
            "chat_id",
            "user_id",
            name="uq_chat_member"
        ),
    )

    id: Mapped[int]= mapped_column(
        primary_key=True
    )

    chat_id: Mapped[int] = mapped_column(
        ForeignKey("chats.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    chat = relationship(
        "Chat",
        back_populates= "members"
    )

    user = relationship(
        "User",
        back_populates="chat_members"
    )