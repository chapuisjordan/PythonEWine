#!/usr/bin/env python3
########################################################################
# Filename    : UltrasonicRanging.py
# Description : Get distance via UltrasonicRanging sensor
# auther      : www.freenove.com
# modification: 2019/12/28
########################################################################
import RPi.GPIO as GPIO
import time
import json
import websockets

#trigPin = 16 --> GPIO 23
#echoPin = 18 --> GPIO 24

#trigPin = 36 --> GPIO 16
#echoPin = 38 --> GPIO 20


#result = '{ "trigPin": 16, "echoPin": 18 }'
#result = '{ "trigPin": 36, "echoPin": 38 }'

# sonar = json.loads(result)

# trigPin = sonar["trigPin"]
# echoPin = sonar["echoPin"]

async def startSonar(trigPin, echoPin):
    print ('Program is starting')

    trigPin = trigPin
    echoPin = echoPin

    await setupSonar(trigPin, echoPin)
    try:
        await loopSonar(trigPin, echoPin)
    except KeyboardInterrupt:  # Press ctrl-c to end the program.
        GPIO.cleanup()         # release GPIO resource

async def startTakeSonar(trigPin, echoPin):
    print('Program is starting')

    trigPin = trigPin
    echoPin = echoPin

    await setupSonar(trigPin, echoPin)
    try:
        await loopSonarEnd(trigPin, echoPin)
    except KeyboardInterrupt:
        GPIO.cleanup()

MAX_DISTANCE = 220          # define the maximum measuring distance, unit: cm
timeOut = MAX_DISTANCE*60   # calculate timeout according to the maximum measuring distance

async def pulseIn(pin,level,timeOut): # obtain pulse time of a pin under timeOut
    t0 = time.time()
    while(GPIO.input(pin) != level):
        if((time.time() - t0) > timeOut*0.000001):
            return 0;
    t0 = time.time()
    while(GPIO.input(pin) == level):
        if((time.time() - t0) > timeOut*0.000001):
            return 0;
    pulseTime = (time.time() - t0)*1000000
    return pulseTime

async def getSonar(trigPin, echoPin):     # get the measurement results of ultrasonic module,with unit: cm
    GPIO.output(trigPin,GPIO.HIGH)      # make trigPin output 10us HIGH level 
    time.sleep(0.00001)     # 10us
    GPIO.output(trigPin,GPIO.LOW) # make trigPin output LOW level 
    pingTime = await pulseIn(echoPin,GPIO.HIGH,timeOut)   # read plus time of echoPin
    distance = pingTime * 340.0 / 2.0 / 10000.0     # calculate distance with sound speed 340m/s 
    return distance

async def setupSonar(trigPin, echoPin):
    GPIO.setmode(GPIO.BOARD)      # use PHYSICAL GPIO Numbering
    GPIO.setup(trigPin, GPIO.OUT)   # set trigPin to OUTPUT mode
    GPIO.setup(echoPin, GPIO.IN)    # set echoPin to INPUT mode

async def loopSonar(trigPin, echoPin):
    while(True):
        distance = await getSonar(trigPin, echoPin) # get distance
        print ("The distance is : %.2f cm"%(distance))
        time.sleep(1)
        if(distance < 7):
            break;
    async with websockets.connect('wss://existenz.fr.nf:3000/node') as websocket:
        await websocket.send(json.dumps({"methodPath": "/node/confirmBottle"}))

async def loopSonarEnd(trigPin, echoPin):
    while(True):
        distance = await getSonar(trigPin, echoPin)
        print("The distance is : %.2f cm"%(distance))
        time.sleep(1)
        if(distance > 7):
            break;
    async with websockets.connect('wss://existenz.fr.nf:3000/node') as websocket:
        await websocket.send(json.dumps({"methodPath": "/node/confirmTakeBottle"}))

#async def gpioCleanUp:
#    GPIO.cleanup()
# if __name__ == '__main__':     # Program entrance
#     print ('Program is starting...')
#     setup()
#     try:
#         loop()
#     except KeyboardInterrupt:  # Press ctrl-c to end the program.
#         GPIO.cleanup()         # release GPIO resource
