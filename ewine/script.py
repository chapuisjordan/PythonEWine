#!/usr/bin/env python3
import asyncio
import datetime
import random
import websockets
# some_file.py
# import sys
# # insert at 1, 0 is the script path (or '' in REPL)
# sys.path.insert(1, 'Freenove_RFID_Starter_Kit_for_Raspberry_Pi/Code/Python_Code/Blink')

import file
from led import Blink

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

async def trigger_method(method):
    if method == "takeBottle" :
        import RPi.GPIO as GPIO
        import time

        #ledPin = 33    # LedPin for GPIO 13
        ledPin = 31 # LedPin for GPIO 17
        #ledPin = 35 # LedPin for GPIO 19
        #ledPin = 40

        def setup():
            GPIO.setmode(GPIO.BOARD)       # use PHYSICAL GPIO Numbering
            GPIO.setup(ledPin, GPIO.OUT)   # set the ledPin to OUTPUT mode
            GPIO.output(ledPin, GPIO.LOW)  # make ledPin output LOW level 
            print ('using pin%d'%ledPin)

        def loop():
            while True:
                GPIO.output(ledPin, GPIO.HIGH)  # make ledPin output HIGH level to turn on led
                print ('led turned on >>>')     # print information on terminal
                time.sleep(1)                   # Wait for 1 second
                GPIO.output(ledPin, GPIO.LOW)   # make ledPin output LOW level to turn off led
                print ('led turned off <<<')
                time.sleep(1)                   # Wait for 1 second

        def destroy():
            GPIO.cleanup()                      # Release all GPIO

        if __name__ == '__main__':    # Program entrance
            print ('Program is starting ... \n')
            setup()
            try:
                loop()
            except KeyboardInterrupt:   # Press ctrl-c to end the program.
                destroy()

start_server = websockets.serve(pub_sub, '192.168.1.26', 5678)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()