#!/usr/bin/env python3
#############################################################################
# Filename    : DHT11.py
# Description :	read the temperature and humidity data of DHT11
# Author      : freenove
# modification: 2018/08/03
########################################################################
import RPi.GPIO as GPIO
import time
import Freenove_DHT as DHT
import asyncio
import websockets
import json

DHTPin = 11     #define the pin of DHT11

async def loop():
    dht = DHT.DHT(DHTPin)   #create a DHT class object
    sumCnt = 0              #number of reading times
    while(True):
        sumCnt += 1         #counting number of reading times
        chk = dht.readDHT11()     #read DHT11 and get a return value. Then determine whether data read is normal according to the return value.
        print ("The sumCnt is : %d, \t chk    : %d"%(sumCnt,chk))
        if (chk is dht.DHTLIB_OK):      #read DHT11 and get a return value. Then determine whether data read is normal according to the return value.
            print("DHT11,OK!")
            value = {"temperature": dht.temperature, "humidite": dht.humidity}
            valueString = json.dumps(value)
        elif(chk is dht.DHTLIB_ERROR_CHECKSUM): #data check has errors
            print("DHTLIB_ERROR_CHECKSUM!!")
            value = "error"
        elif(chk is dht.DHTLIB_ERROR_TIMEOUT):  #reading DHT times out
            print("DHTLIB_ERROR_TIMEOUT!")
            value = "error"
        else:
            print("error")

        print("Humidity : %.2f, \t Temperature : %.2f \n"%(dht.humidity,dht.temperature))
        print("value : ", value)
        await hello(value)
        time.sleep(60)

async def hello(value):
    async with websockets.connect('ws://192.168.1.27:5678/broadcast/temperature/write') as websocket:
        while True:
            await websocket.send(value)

if __name__ == '__main__':
    print ('Program is starting ... ')
    try:
        asyncio.run(loop())
    except KeyboardInterrupt:
        GPIO.cleanup()
        exit()

