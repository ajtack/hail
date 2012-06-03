#
# Drives the node.js client on the other side to drive two requests, verifying that this behaves as expected.
#

import Ice;
Ice.loadSlice('printer.ice');
import Demo

ic = Ice.initialize();
proxy = ic.stringToProxy('X:tcp -h localhost -p 4001');

class callbacky:
    def ice_response(self):
        print "Got answer!"
    def ice_exception(self, e):
        print "Got " + str(e)

printer = Demo.PrinterPrx.uncheckedCast(proxy, "abc")
printer.printString_async(callbacky(), "Blah!")

import time
time.sleep(0.1)
printer.printString_async(callbacky(), "Blah a second time!")
