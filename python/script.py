#!/usr/bin/env python3
 
import asyncio
import datetime
import random
import websockets
 
connected = set()
 
async def pub_sub(websocket, path):
    global connected
    if path == '/broadcast/temperature/read' :        
        connected.add(websocket)
        print("READER "+str(websocket.remote_address)+"    connected")
        while True:
            await asyncio.sleep(100)
    elif path == '/broadcast/temperature/write' :
        print("WRITER "+str(websocket.remote_address)+"    connected")
        try :
            while True:
                data = await websocket.recv()
                print("MULTICAST: "+data)
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
             
start_server = websockets.serve(pub_sub, '192.168.1.28', 5678) 
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()