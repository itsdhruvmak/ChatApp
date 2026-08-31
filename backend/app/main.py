from fastapi import FastAPI, Depends

from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.websocket import router as websocket_router
from app.core.dependencies import get_current_user
from app.models.user import User

app = FastAPI(
    title="Chat App API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://chat-app-lac-delta-96.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(websocket_router)

@app.get("/")
def root():
    return {
        "message": "Chat app api is running."
    }

@app.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email":current_user.email,
        "is_verified":current_user.is_verified
    }