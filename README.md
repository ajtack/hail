hail — nodes of ice
===================

A server framework for ZeroC Ice RPC clients.

progress notes
--------------

To exercise current functionality, start with the following Slice file:

	module Demo {
	    interface Printer {
	        void printString(string s);
	    };
	};

Start the node server with `node driver.js`. This will run an Ice server with one Ice object that will respond to the printString method. To test this, run the following with ZeroC's own _blessed_ ice client library in Python.

	$ python2.6
	Python 2.6.7 (r267:88850, Mar 13 2012, 00:08:50) 
	[GCC 4.2.1 Compatible Apple Clang 3.0 (tags/Apple/clang-211.12)] on darwin
	Type "help", "copyright", "credits" or "license" for more information.
	>>> import Ice
	>>> Ice.loadSlice('printer.ice')
	>>> import Demo
	>>> proxy = ic.stringToProxy('X:tcp -h localhost -p 4001')
	>>> printer = Demo.PrinterPrx.uncheckedCast(proxy)
	>>> printer.printString("A pack of lies!");

The Node server using _hail_ will process the request header and print out the request body. You will see something like this:

	$ node driver.js 
	Started listening!
	X.printString("A pack of lies!");

The Python client will also finish the request (the response is void). This demonstrates the end-to-end request-response flow currently implemented in Ice.

next steps
----------

`Hail` is not a complete implmentation of Ice. The next step would be hosting an Ice object and completing an `isA` call against it from Python (the result of checkedCast), together with the associated exception replies. Dictionary argument types are still unhandled, and until now we only support `void` and `int` return types on remote invocations.

The model for method dispatch, however, is done, with the shape below. This pattern, with the use of EventEmitters and response callbacks, is to be preserved.

    servant.on('printString', function(resp, s) {
    	console.log("Printing a string!");
    	resp.send();
    });
