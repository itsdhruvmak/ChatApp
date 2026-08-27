import asyncio
import websockets


async def test():

    uri = "ws://127.0.0.1:8000/ws/chats/2"

    async with websockets.connect(uri) as websocket:

        print("WebSocket connected!")

        await websocket.send(
            '{"content": "Hello from WebSocket"}'
        )

        response = await websocket.recv()

        print("Server response:")
        print(response)


asyncio.run(test())