from datetime import datetime

from pydantic import BaseModel, ConfigDict
from app.schemas.media import MediaResponse

class CreateChatRequest(BaseModel):
    user_id: int

class CreateGroupChatRequest(BaseModel):
    name: str
    user_ids: list[int]

class ChatResponse(BaseModel):
    id: int
    type: str
    name: str | None
    created_at: datetime
    member_count: int

    model_config=ConfigDict(from_attributes=True)

class ChatListResponse(BaseModel):
    id: int
    type: str
    username: str | None
    name: str | None
    created_at: datetime
    updated_at: datetime
    member_count: int

    model_config = ConfigDict(from_attributes=True)

class SendMessageRequest(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    content:str
    message_type: str
    created_at: datetime
    updated_at: datetime

    media: list[MediaResponse] = []

    model_config = ConfigDict(from_attributes=True)