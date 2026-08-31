from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.models.email_verification import EmailVerification
from app.models.user import User
from app.core.dependencies import get_current_user

from app.schemas.auth import (
    loginRequest,
    RegisterRequest,
    TokenResponse,
    verifyOTPRequest,
    UserSearchResponse
)
from app.services.auth import (
    register_user,
    search_users
    )

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)

def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    try:
        user = register_user(
            db=db,
            data=data
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )

    return {
        "message":"Registration successful. OTP sent to your email.",
        "email": user.email
    }

@router.post("/verify-otp")
def verify_otp(
    data: verifyOTPRequest,
    db: Session = Depends(get_db)
):

    user = db.scalar(
    select(User)
    .where(User.email == data.email)
    .order_by(User.created_at.desc())
)
    # user = db.scalar(
    #     select(User).where(
    #         User.email == data.email
    #     )
    # )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.is_verified:
        return {
            "message": "Email already verified."
        }

    verification = db.scalar(
        select(EmailVerification)
        .where(
            EmailVerification.user_id==user.id
        )
        .order_by(
            EmailVerification.created_at.desc()
        )
    )

    if not verification:
        raise HTTPException(
            status_code=400,
            detail="OTP not found"
        )

    if verification.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="OTP has expired"
        )

    if not verify_password(
        data.otp,
        verification.otp_hash
    ):
        verification.attempts+= 1

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    user.is_verified=True

    db.commit()

    token = create_access_token(user.id)
    print(f"VERIFY-OTP RESPONSE TOKEN: {token}")  # TEMP DEBUG

    return {
        "message": "Email verified successfully.",
        "access_token": token,
        "token_type": "bearer"
    }

@router.post(
    "/login",
    response_model=TokenResponse
)

def login(
    data:loginRequest,
    db:Session = Depends(get_db)
):
    user = db.scalar(
        select(User).where(
            # User.email == data.email
            User.username == data.username
        )
    )

    if not user:
        raise HTTPException(
            status_code=401,
            # detail="Invalid Email or Password"
            detail="Invalid Username or Password"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            # detail="Invalid Email or Password"
            detail="Invalid Username or Password"
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=303,
            detail="please verify your email first."
        )

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get(
    "/search",
    response_model=list[UserSearchResponse]
)

def search_users_endpoint(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return search_users(
        db=db,
        current_user=current_user,
        query=q
    )


