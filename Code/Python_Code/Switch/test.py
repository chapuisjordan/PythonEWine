import RPi.GPIO as GPIO
import time

gpio_pin_number_open=12
gpio_pin_number_close=21
#Replace YOUR_CHOSEN_GPIO_NUMBER_HERE with the GPIO pin number you wish to use
#Make sure you know which rapsberry pi 
GPIO.setmode(GPIO.BCM)
#Use BCM pin numbering (i.e. the GPIO number, not pin number)
#WARNING: this will change between Pi versions
#Check yours first and adjust accordingly

GPIO.setup(12, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(21, GPIO.IN, pull_up_down=GPIO.PUD_UP)
#It's very important the pin is an input to avoid short-circuits
#The pull-up resistor means the pin is high by default


def state_btn(channel):
    if GPIO.input(gpio_pin_number_open) == 1:
        print('ouverture')
    elif GPIO.input(gpio_pin_number_open) == 0:
        print('fermeture')

def loop():
    GPIO.add_event_detect(gpio_pin_number_open, GPIO.FALLING, callback =  state_btn)
    GPIO.add_event_detect(gpio_pin_number_close, GPIO.FALLING, callback = state_btn)

    while True:
        pass
#        if GPIO.input(gpio_pin_number_open) == 1:
 #           print('ouverture')
  #      else GPIO.input(gpio_pin_number_open) == 0:
   #         print('fermeture')

if __name__ == '__main__':
    print("program is starting")
    try:
        loop()
   # GPIO.wait_for_edge(gpio_pin_number, GPIO.FALLING)
    #Use falling edge detection to see if pin is pulled 
    #low to avoid repeated polling
    except:
        GPIO.cleanup()

