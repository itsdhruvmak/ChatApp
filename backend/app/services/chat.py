from sqlalchemy import select,func
from sqlalchemy.orm import Session

from app.models.chat import Chat
from app.models.chat_member import ChatMember
from app.models.message import Message
from app.models.user import User

def create_private_chat(
        db: Session,
        current_user: User,
        other_user_id: int
) -> Chat:

    if current_user.id == other_user_id:
        raise ValueError("You cannot create a chat with your seldf.")

    other_user = db.scalar(
        select(User).where(User.id == other_user_id)
    )

    if not other_user:
        raise ValueError("User not found")

    #Find Existing private chats
    user_chat_ids = select(ChatMember.chat_id).where(
        ChatMember.user_id == current_user.id
    )

    existing_chat = db.scalar(
        select(Chat)
        .join(ChatMember)
        .where(
            ChatMember.user_id == other_user_id,
            Chat.id.in_(user_chat_ids),
            Chat.type == "private"
        )
    )

    if existing_chat:
        return existing_chat

    chat = Chat(
        type = "private"
    )

    db.add(chat)
    db.flush()

    db.add_all([
        ChatMember(
            chat_id=chat.id,
            user_id=current_user.id
        ),
        ChatMember(
            chat_id=chat.id,
            user_id=other_user_id
        )
    ])

    db.commit()
    db.refresh(chat)

    return chat

def get_user_chats(
    db: Session,
    current_user: User
):
    statement = (
        select(
            Chat,
            func.count(ChatMember.id).label("member_count")
        )
        .join(
            ChatMember,
            ChatMember.chat_id == Chat.id
        )
        .where(
            Chat.id.in_(
                select(ChatMember.chat_id).where(
                    ChatMember.user_id == current_user.id
                )
            )
        )
        .group_by(Chat.id)
        .order_by(Chat.updated_at.desc())
    )

    results = db.execute(statement).all()

    response = []

    for chat, member_count in results:

        username = None

        if chat.type == "private":

            other_member = db.scalar(
                select(ChatMember)
                .where(
                    ChatMember.chat_id == chat.id,
                    ChatMember.user_id != current_user.id
                )
            )

            if other_member:
                other_user = db.get(
                    User,
                    other_member.user_id
                )

                if other_user:
                    username = other_user.username

        response.append({
            "id": chat.id,
            "type": chat.type,
            "name": chat.name,
            "username": username,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at,
            "member_count": member_count,
        })

    return response

def get_chat(
    db: Session,
    chat_id: int,
    current_user: User
) -> Chat:

    chat = db.scalar(
        select(Chat)
        .join(
            ChatMember,
            ChatMember.chat_id == Chat.id
        )
        .where(
            Chat.id == chat_id,
            ChatMember.user_id == current_user.id
        )
    )

    if not chat:
        raise ValueError("Chat not found")

    return chat

def get_chat_messages(
        db:Session,
        chat_id: int,
        current_user:User
):
    get_chat(db, chat_id, current_user)

    return db.scalars(
        select(Message)
        .where(
            Message.chat_id == chat_id
        )
        .order_by(Message.created_at.asc())
    ).all()

def send_message(
        db:Session,
        chat_id: int,
        current_user: User,
        content: str
) -> Message:

    get_chat(db, chat_id, current_user)

    if not content.strip():
        raise ValueError("Message cannot be empty")

    message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=content.strip(),
        message_type="text"
    )

    db.add(message)

    chat = db.get(Chat, chat_id)

    if chat:
        chat.updated_at=func.now()

    db.commit()
    db.refresh(message)

    return message

def create_group_chat(
    db: Session,
    current_user: User,
    name: str,
    user_ids: list[int]
) -> Chat:

    name = name.strip()

    if not name:
        raise ValueError("Group name cannot be empty.")

    if not user_ids:
        raise ValueError("At least one member is required.")

    # Remove duplicate user IDs
    user_ids = list(set(user_ids))

    # Make sure creator is included
    if current_user.id not in user_ids:
        user_ids.append(current_user.id)

    # Find all requested users
    users = db.scalars(
        select(User).where(
            User.id.in_(user_ids)
        )
    ).all()

    if len(users) != len(user_ids):
        raise ValueError("One or more users were not found.")

    # Create group
    chat = Chat(
        type="group",
        name=name
    )

    db.add(chat)
    db.flush()

    # Add members
    members = [
        ChatMember(
            chat_id=chat.id,
            user_id=user_id
        )
        for user_id in user_ids
    ]

    db.add_all(members)

    db.commit()
    db.refresh(chat)

    return chat