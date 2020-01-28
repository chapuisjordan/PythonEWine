import asyncio
import websockets
async def hello():
    async with websockets.connect('ws://localhost:5678/broadcast/write') as websocket:
        while True:
            name = input("Message ? ")
            await websocket.send(name)
asyncio.get_event_loop().run_until_complete(hello())