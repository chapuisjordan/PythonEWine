
import RPi.GPIO as GPIO
import time


GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
#GPIO.setup(12, GPIO.IN)
#GPIO.setup(21, GPIO.IN)

buttonOpen = 12
buttonClose = 21

def setup():

    GPIO.setup(buttonOpen, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(buttonClose, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def loop():
    while True:
        if GPIO.input(buttonOpen) == 1:
            print ('Ouverture')
        elif GPIO.input(buttonOpen) == 0:
            print ('Fermeture')

def destroy():

    GPIO.cleanup()

if __name__ == '__main__':

    print ('Program is starting...')
    setup()

    try:
        loop()

    except KeyboardInterrupt:
        destroy()




