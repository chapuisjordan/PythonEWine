#!/usr/bin/env python3
import asyncio
import datetime
import random
import websockets
import json
# some_file.py
# import sys
# # insert at 1, 0 is the script path (or '' in REPL)
# sys.path.insert(1, 'Freenove_RFID_Starter_Kit_for_Raspberry_Pi/Code/Python_Code/Blink')

<<<<<<< Updated upstream
=======
#import file
#from led import Blink
#import file
>>>>>>> Stashed changes
from led import setup, loop, destroy

connected = set()
async def pub_sub(websocket, path):
    global connected
    if path == '/broadcast/read' :
        connected.add(websocket)
        print("READER "+str(websocket.remote_address)+"    connected")
        while True:
            await asyncio.sleep(100)
    elif path == '/broadcast/write' :
        print("WRITER "+str(websocket.remote_address)+"    connected")
        try :
            while True:
                data = await websocket.recv()
                await trigger_method(data)
                still_connected = set()
                for ws in connected :
                    if ws.open:
                        still_connected.add(ws)
                        await asyncio.wait([ws.send(data)])
                    else:
                        print("READER "+str(ws.remote_address)+" disconnected")
                    connected=still_connected
        except:
            print("WRITER "+str(websocket.remote_address)+" disconnected")

<<<<<<< Updated upstream
async def trigger_method(message):
    print(message)
    y = json.loads(message)
    print(y["method"])
    if y["method"] == "takeBottle" :
=======
async def trigger_method(method):
    print(method)
    #print(type('{ "name":"John", "age":30, "city":"New York"}'))
    print(type(method))
    y = json.loads(method)
    print(y["name"])
    if method == "takeBottle" :
>>>>>>> Stashed changes
        import RPi.GPIO as GPIO
        import time
#        ledPin = y.ledPin
        setup()
        loop()
#    if

#start_server = websockets.serve(pub_sub, '127.0.0.1', 5678)
start_server = websockets.serve(pub_sub, '192.168.1.26', 5678)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
