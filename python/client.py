import asyncio
import websockets

async def hello():
    async with websockets.connect('ws://127.0.0.1:5678/led/start') as websocket:
        while True:
            name = input("Message ? ")

            data = 31

            await websocket.send(data)
asyncio.get_event_loop().run_until_complete(hello())
