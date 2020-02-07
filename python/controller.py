import websockets
import asyncio
import json
from led import setup, loop, destroy, startLum, stopLum, cleanupGpio
from sonar import startSonar, startTakeSonar

async def listenMessage():
    print('listenMessage again')
    async with websockets.connect('wss://existenz.fr.nf:3000/node/controllerPython') as websocket:
        message = await websocket.recv()
        print('message : ' + message)
        messageParse = json.loads(message)
        print(messageParse)
        if(messageParse['method'] == "startLed"):
            await startLed(messageParse['ledPin'])
            await sonarStart(messageParse['ledPin'], messageParse['trigPin'], messageParse['echoPin'])
        elif(messageParse['method'] == "stopLed"):
            #await startLedTake(messageParse['ledPin'])
            await sonarStartTake(messageParse['trigPin'], messageParse['echoPin'], messageParse['ledPin'])
        elif(messageParse['method'] == "startSonar"):
            await sonarStart(messageParse['trigPin'], messageParse['echoPin'])

async def startLed(ledPin):
#    cleanupGpio()
#    await startLedTake(ledPin)
    print('ok')
    print(ledPin)
    setup(ledPin)
    startLum(ledPin)

async def startLedTake(ledPin):
    destroy(ledPin)

async def sonarStart(ledPin, trigPin, echoPin):
    await startSonar(trigPin, echoPin)
    await startLedTake(ledPin)
    await listenMessage()

async def sonarStartTake(trigPin, echoPin, ledPin):
    print('sonarStop')
    await startLed(ledPin)
    await startTakeSonar(trigPin, echoPin)
    await startLedTake(ledPin)
    await listenMessage()

asyncio.get_event_loop().run_until_complete(listenMessage())
