import websockets
import asyncio
import json
from led import setup, loop, destroy, startLum, stopLum
from sonar import startSonar

async def listenMessage():
    print('listenMessage again')
    async with websockets.connect('wss://existenz.fr.nf:3000/node/controllerPython') as websocket:
        message = await websocket.recv()
        print('message : ' + message)
        messageParse = json.loads(message)
        print(messageParse)
        if(messageParse['method'] == "startLed"):
            await startLed(messageParse['ledPin'])
            await sonarStart(messageParse['trigPin'], messageParse['echoPin'])
        elif(messageParse['method'] == "stopLed"):
            await stopLed(messageParse['ledPin'])
        elif(messageParse['method'] == "startSonar"):
            await sonarStart(messageParse['trigPin'], messageParse['echoPin'])

async def startLed(ledPin):
    print(ledPin)
    setup(ledPin)
    startLum(ledPin)

async def stopLed(ledPin):
    print('ok')
    destroy(ledPin)
    await listenMessage()

async def sonarStart(trigPin, echoPin):
    startSonar(trigPin, echoPin)
    print('sonarStart')
    await listenMessage();

async def sonarStop():
    print('sonarStop')

asyncio.get_event_loop().run_until_complete(listenMessage())
