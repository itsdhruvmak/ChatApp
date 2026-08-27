from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.core.websocket import manager
from app.models.chat import Chat
from app.models.chat_member import ChatMember
from app.models.message import Message


router = APIRouter(
    tags=["WebSocket"]
)


@router.websocket("/ws/chats/{chat_id}")
async def websocket_chat(
    websocket: WebSocket,
    chat_id: int
):
    db: Session = SessionLocal()

    user_id = None

    try:
        # -------------------------
        # 1. Get JWT
        # -------------------------

        token = websocket.query_params.get("token")

        if not token:
            await websocket.close(code=1008)
            return

        # -------------------------
        # 2. Decode JWT
        # -------------------------

        try:
            payload = decode_access_token(token)

            user_id = payload.get("sub")

            if not user_id:
                await websocket.close(code=1008)
                return

            user_id = int(user_id)

        except Exception:
            await websocket.close(code=1008)
            return

        # -------------------------
        # 3. Check chat membership
        # -------------------------

        membership = db.scalar(
            select(ChatMember).where(
                ChatMember.chat_id == chat_id,
                ChatMember.user_id == user_id
            )
        )

        if not membership:
            await websocket.close(code=1008)
            return

        # -------------------------
        # 4. Connect USER
        # -------------------------
        # IMPORTANT:
        # ConnectionManager now uses:
        #
        # user_id -> WebSocket connections
        #
        # NOT:
        # chat_id -> WebSocket connections

        await manager.connect(
            user_id,
            websocket,
            chat_id=chat_id
        )

        # -------------------------
        # 5. Receive messages
        # -------------------------

        while True:

            data = await websocket.receive_json()

            content = data.get("content")

            if not content or not content.strip():
                continue

            # -------------------------
            # 6. Create message
            # -------------------------

            message = Message(
                chat_id=chat_id,
                sender_id=user_id,
                content=content.strip(),
                message_type="text"
            )

            db.add(message)

            # Update chat timestamp
            chat = db.get(Chat, chat_id)

            if chat:
                chat.updated_at = func.now()

            db.commit()
            db.refresh(message)

            # -------------------------
            # 7. Prepare message data
            # -------------------------

            message_data = {
                "id": message.id,
                "chat_id": message.chat_id,
                "sender_id": message.sender_id,
                "content": message.content,
                "message_type": message.message_type,
                "created_at": message.created_at.isoformat()
            }

            # -------------------------
            # 8. Get chat members
            # -------------------------

            members = db.scalars(
                select(ChatMember).where(
                    ChatMember.chat_id == chat_id
                )
            ).all()

            # -------------------------
            # 9. Send message to ALL
            #    chat members
            # -------------------------

            for member in members:
                await manager.send_to_chat(member.user_id, chat_id, message_data)
                await manager.send_notification(member.user_id, message_data)

    except WebSocketDisconnect:

        if user_id is not None:
            manager.disconnect(
                user_id,
                websocket
            )

    finally:
        db.close()

@router.websocket("/ws/notifications")
async def websocket_notifications(
    websocket: WebSocket
):
    db: Session = SessionLocal()

    user_id = None

    try:
        token = websocket.query_params.get("token")

        if not token:
            print("Notification WS: No token")
            await websocket.close(code=1008)
            return

        try:
            payload = decode_access_token(token)

            user_id = payload.get("sub")

            if not user_id:
                print("Notification WS: No user ID")
                await websocket.close(code=1008)
                return

            user_id = int(user_id)

        except Exception as error:
            print(
                "Notification WS: JWT error:",
                error
            )

            await websocket.close(code=1008)
            return

        await manager.connect(
            user_id,
            websocket,
        )

        print(
            f"Notification WebSocket connected: user {user_id}"
        )

        while True:
            await websocket.receive()

    except WebSocketDisconnect as error:

        print(
            f"Notification WebSocket disconnected: "
            f"user={user_id}, code={error.code}"
        )

        if user_id is not None:
            manager.disconnect(
                user_id,
                websocket
            )

    except Exception as error:

        print(
            f"Notification WebSocket ERROR: "
            f"user={user_id}, error={error}"
        )

        if user_id is not None:
            manager.disconnect(
                user_id,
                websocket
            )

    finally:
        db.close()