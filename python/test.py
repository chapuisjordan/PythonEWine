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
#import file
from led import setup, loop, destroy

connected = set()
async def pub_sub(websocket, path):
    global connected
    if path == '/broadcast/' :
        print("READER TEST "+str(websocket.remote_address)+"    connected")
        try :
            while True:
                data = await websocket.recv()
                print(data)
#                await trigger_method(data)
                still_connected = set()
                for ws in connected :
                    if ws.open:
                        still_connected.add(ws)
                        await asyncio.wait([ws.send(data)])
                    else:
                        print("READER TEST "+str(ws.remote_address)+" disconnected")
                    connected=still_connected
        except:
            print("READER TEST "+str(websocket.remote_address)+" disconnected")

#start_server = websockets.serve(pub_sub, '127.0.0.1', 5678)
start_server = websockets.serve(pub_sub, '192.168.1.28', 5678)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
