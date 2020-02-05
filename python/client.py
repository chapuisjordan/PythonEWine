import asyncio
import websockets
async def hello():
    async with websockets.connect('ws://existenz.fr.nf:3000/node') as websocket:
        while True:
            name = input("Message ? ")
            await websocket.send(name)
asyncio.get_event_loop().run_until_complete(hello())
