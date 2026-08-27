from datetime import datetime

from sqlalchemy import DateTime,String, func,select
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property



from app.core.database import Base

class Chat(Base):
    __tablename__="chats"

    id: Mapped[int] = mapped_column(primary_key=True)

    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="private"
    )

    name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at:Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    members = relationship(
        "ChatMember",
        back_populates="chat",
        cascade="all, delete-orphan"
    )

    messages = relationship(
        "Message",
        back_populates="chat",
        cascade="all, delete-orphan"
    )

    @hybrid_property
    def member_count(self) -> int:
        return len(self.members)


