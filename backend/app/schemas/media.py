from datetime import datetime

from pydantic import BaseModel, ConfigDict

class MediaResponse(BaseModel):
    id: int
    message_id: int
    public_id: str
    secure_url:str
    resource_type: str
    file_name: str
    mime_type: str
    file_size: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)