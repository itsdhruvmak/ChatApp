from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func

import cloudinary
import cloudinary.uploader

from app.core import cloudinary as cloudinary_config

from app.models.chat import Chat
from app.models.message import Message
from app.models.media import Media
from app.services.chat import get_chat

async def upload_chat_media(
        db: Session,
        chat_id: int,
        current_user,
        file: UploadFile
):
    get_chat(
        db=db,
        chat_id=chat_id,
        current_user=current_user
    )

    if not file.filename:
        raise ValueError("File name is required.")

    result = cloudinary.uploader.upload(
        file.file,
        resource_type= "auto"
    )

    resource_type=result.get(
        "resource_type",
        "raw"
    )

    if resource_type == "image":
        message_type="image"

    elif resource_type == "video":
        message_type = "video"

    elif resource_type == "audio":
        message_type = "audio"

    else:
        message_type = "document"

    message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        content="",
        message_type=message_type
    )

    db.add(message)
    db.flush()

    media = Media(
        message_id=message.id,
        public_id=result["public_id"],
        secure_url=result["secure_url"],
        resource_type=result["resource_type"],
        file_name=file.filename,
        mime_type=file.content_type or "application/octet-stream",
        file_size=None
    )

    db.add(media)

    chat = db.get(Chat, chat_id)

    if chat:
        chat.updated_at = func.now()

    db.commit()

    db.refresh(message)
    db.refresh(media)

    return message