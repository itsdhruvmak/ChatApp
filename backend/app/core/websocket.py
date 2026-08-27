from typing import Optional
from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):
        # user_id -> list of (websocket, chat_id)
        # chat_id is None for the /ws/notifications socket,
        # or the specific chat_id for a /ws/chats/{chat_id} socket
        self.active_connections: dict[int, list[tuple[WebSocket, Optional[int]]]] = {}

    async def connect(
        self,
        user_id: int,
        websocket: WebSocket,
        chat_id: Optional[int] = None
    ):
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = []

        self.active_connections[user_id].append((websocket, chat_id))

    def disconnect(
        self,
        user_id: int,
        websocket: WebSocket
    ):
        if user_id in self.active_connections:

            self.active_connections[user_id] = [
                (ws, cid)
                for ws, cid in self.active_connections[user_id]
                if ws is not websocket
            ]

            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_to_chat(
        self,
        user_id: int,
        chat_id: int,
        message: dict
    ):
        """Deliver only to sockets that are actively viewing this exact chat."""
        connections = self.active_connections.get(user_id, [])

        for ws, cid in connections:
            if cid == chat_id:
                await ws.send_json(message)

    async def send_notification(
        self,
        user_id: int,
        message: dict
    ):
        """Deliver to the user's notification socket(s), regardless of open chat."""
        connections = self.active_connections.get(user_id, [])

        for ws, cid in connections:
            if cid is None:
                await ws.send_json(message)


manager = ConnectionManager()