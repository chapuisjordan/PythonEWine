import RPi.GPIO as g
from time import sleep
from subprocess import Popen

g.setmode(g.BCM)
g.setup(20,g.IN)

def p26_callback(channel):
  print ('ouverture')
  sleep(1)
  return

g.add_event_detect(20, g.FALLING, callback=p26_callback)

try:
    print("try")
finally:
    g.cleanup()
