#!/usr/bin/env python3
########################################################################
# Filename    : Blink.py
# Description : Basic usage of GPIO. Let led blink.
# auther      : www.freenove.com
# modification: 2019/12/28
########################################################################
import RPi.GPIO as GPIO
import time

#ledPin = 33    # LedPin for GPIO 13
#ledPin = 31 # LedPin for GPIO 17
#ledPin = 35 # LedPin for GPIO 19
#ledPin = 4

def cleanupGpio():
    GPIO.cleanup()

def setup(ledPin):
    GPIO.setmode(GPIO.BOARD)       # use PHYSICAL GPIO Numbering
    GPIO.setup(ledPin, GPIO.OUT)   # set the ledPin to OUTPUT mode
    GPIO.output(ledPin, GPIO.LOW)  # make ledPin output LOW level 
    print ('using pin%d'%ledPin)


def loop(ledPin):
    while True:
        GPIO.output(ledPin, GPIO.HIGH)  # make ledPin output HIGH level to turn on led
        print ('led turned on >>>')     # print information on terminal
        time.sleep(1)                   # Wait for 1 second
        GPIO.output(ledPin, GPIO.LOW)   # make ledPin output LOW level to turn off led
        print ('led turned off <<<')
        time.sleep(1)                   # Wait for 1 second

def startLum(ledPin):
    GPIO.output(ledPin, GPIO.HIGH)

def stopLum():
    GPIO.setwarning(False)

def destroy(ledPin):
    GPIO.cleanup()                      # Release all GPIO


#if __name__ == '__main__':    # Program entrance
#    print ('Program is starting ... \n')
#    setup(ledPin)
#    try:
#        loop(ledPin)
#    except KeyboardInterrupt:   # Press ctrl-c to end the program.
#        destroy(ledPin)

