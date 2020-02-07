
import RPi.GPIO as GPIO
import time
import asyncio
from sonartest import getSonar, setupSonar

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
#GPIO.setup(12, GPIO.IN)
#GPIO.setup(21, GPIO.IN)

gpio_pin_number_open = 12
gpio_pin_number_close = 21

def setup():
    GPIO.setup(gpio_pin_number_open, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(gpio_pin_number_close, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def state_btn(channel):
    if GPIO.input(gpio_pin_number_open) == 1:
        print('ouverture')
    elif GPIO.input(gpio_pin_number_open) == 0:
        print('fermeture')
        doorClose(36, 38)
        doorClose(16, 18)

def loop():
    setup()
    #callback = await state_btn
    GPIO.add_event_detect(gpio_pin_number_open, GPIO.FALLING, callback = state_btn)
    GPIO.add_event_detect(gpio_pin_number_close, GPIO.FALLING, callback = state_btn)
    while True:
        pass

def destroy():
    GPIO.cleanup()

def doorClose(trigPin, echoPin):
    setupSonar(trigPin, echoPin)
    getSonar(trigPin, echoPin)
#startSonar(36, 38)

asyncio.get_event_loop().run_forever(loop())



