from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.chat import (
    ChatListResponse,
    ChatResponse,
    CreateChatRequest,
    CreateGroupChatRequest,
    MessageResponse,
    SendMessageRequest
)

from fastapi import File, UploadFile
from app.services.media import upload_chat_media
from app.schemas.media import MediaResponse

from app.services.chat import (
    create_private_chat,
    create_group_chat,
    get_chat,
    get_chat_messages,
    get_user_chats,
    send_message
)

router = APIRouter(
    prefix="/chats",
    tags=["Chats"]
)

@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_201_CREATED
)

def create_chat(
    data: CreateChatRequest,
    current_user: User = Depends(get_current_user),
    db:Session = Depends(get_db)
):
    try:
        return create_private_chat(
            db=db,
            current_user=current_user,
            other_user_id=data.user_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post(
    "/group",
    response_model=ChatResponse,
    status_code=status.HTTP_201_CREATED
)
def create_group(
    data: CreateGroupChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return create_group_chat(
            db=db,
            current_user=current_user,
            name=data.name,
            user_ids=data.user_ids
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.get(
    "",
    response_model=list[ChatListResponse]
)
def get_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_chats(
        db=db,
        current_user=current_user
    )

@router.get(
    "/{chat_id}",
    response_model=ChatResponse
)

def get_single_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_chat(
            db=db,
            chat_id=chat_id,
            current_user=current_user
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

@router.get(
    "/{chat_id}/messages",
    response_model=list[MessageResponse]
)

def get_messages(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_chat_messages(
            db=db,
            chat_id=chat_id,
            current_user=current_user
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

@router.post(
    "/{chat_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED
)

def create_message(
    chat_id: int,
    data:SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return send_message(
            db=db,
            chat_id=chat_id,
            current_user=current_user,
            content=data.content
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# Media upload route
@router.post(
    "/{chat_id}/messages/media",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED
)

async def upload_chat_media_endpoint(
    chat_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return await upload_chat_media(
            db=db,
            chat_id=chat_id,
            current_user=current_user,
            file=file
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )