import time
import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BCM)

btn_open = 12;
btn_close = 21;

# GPIO btn_input set up as input.
GPIO.setup(btn_open, GPIO.IN)
GPIO.setup(btn_close, GPIO.OUT)

# handle the button event
def buttonEventHandler_rising (pin):
    # turn LED on
    GPIO.output(btn_open,True)
    
def buttonEventHandler_falling (pin):
    # turn LED off
    GPIO.output(btn_open,False)


	
GPIO.add_event_detect(btn_open, GPIO.RISING, callback=buttonEventHandler_rising) 
GPIO.add_event_detect(btn_open, GPIO.FALLING, callback=buttonEventHandler_falling)
 
try:  
    while True : pass  
except:
    GPIO.cleanup() 
