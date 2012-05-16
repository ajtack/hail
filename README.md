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

Start the node server with `node driver.js`. This will run an Ice server with no objects, but which will accept and validate Ice connections. To test this, run the following with ZeroC's own _blessed_ ice client library in Python.

	$ python2.6
	Python 2.6.7 (r267:88850, Mar 13 2012, 00:08:50) 
	[GCC 4.2.1 Compatible Apple Clang 3.0 (tags/Apple/clang-211.12)] on darwin
	Type "help", "copyright", "credits" or "license" for more information.
	>>> import Ice
	>>> Ice.loadSlice('printer.ice')
	>>> import Demo
	>>> proxy = ic.stringToProxy('X:tcp -h localhost -p 4001')
	>>> printer = Demo.PrinterPrx.checkedCast(proxy)

The Node server using _hail_ will process the request header and print out the request body. You will see something like this:

	$ node driver.js 
	Started listening!
	Request
	H: {"message_type":"request","compression_mode":0,"body_length":54}
	B: Xice_isA::Demo::Printer
	Produced event request

These lines show (poorly) the `H:` header and the `B:` body of the request. The `checkedCast` line we ran in the Python session is the equivalent of running `X.isA("::Demo::Printer")`, all of which we see printed here. The hex output reveals the complete Ice::Request structure.

next steps
----------

As you see, `hail` has not gotten especially far. The next step would be hosting an Ice object and completing an `isA` call against it from Python. After that, correct parsing of arguments will allow us to run arbitrary methods on an object.

The model for method dispatch will be event emitters. The following might be the shape of server code using _hail_ to server the `Demo::Printer` object.

    server.on('printString', function(s) {
    	console.log("Printing a string!")
    });
