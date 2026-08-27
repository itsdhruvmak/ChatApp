from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    func
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class Media(Base):
    __tablename__="media"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    message_id: Mapped[int] = mapped_column(
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    public_id: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    secure_url: Mapped[str] = mapped_column(
        String(1000),
        nullable=False
    )

    resource_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    file_size: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    message = relationship(
        "Message",
        back_populates="media"
    )