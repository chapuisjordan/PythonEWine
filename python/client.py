import asyncio
import websockets
async def hello():
    async with websockets.connect('ws://127.0.0.1:5678/broadcast/temperature/write') as websocket:
        while True:
            name = input("Message ? ")
            await websocket.send(name)
asyncio.get_event_loop().run_until_complete(hello())
