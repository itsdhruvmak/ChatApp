from datetime import datetime,timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.email_verification import EmailVerification
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.services.email import send_otp_email
from app.utils.otp import generate_otp

def register_user(
        db:Session,
        data: RegisterRequest
) -> User:

    existing_user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if existing_user:
        raise ValueError("Email already registered.")

    existing_username= db.scalar(
        select(User).where(User.username == data.username)
    )

    if existing_username:
        raise ValueError("Username already taken.")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        is_verified=False
    )

    db.add(user)
    db.flush()

    otp = generate_otp()

    verification = EmailVerification(
        user_id=user.id,
        otp_hash=hash_password(otp),
        expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=10)
    )

    db.add(verification)

    send_otp_email(
        recipient=user.email,
        otp=otp
    )

    db.commit()
    db.refresh(user)

    return user

def authenticate_user(
        db:Session,
        email:str,
        password:str
) -> User | None:

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash
    ): 
        return None

    return user

def search_users(
        db:Session,
        current_user:  User,
        query: str
):

    query= query.strip()

    if not query:
        return []

    statement = (
        select(User)
        .where(
            User.username.ilike(f"%{query}%"),
            User.id != current_user.id
        )
        .order_by(User.username)
        .limit(10)
    )

    return db.scalars(statement).all()