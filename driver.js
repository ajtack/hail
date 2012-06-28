var ice = require('./index');

var adapter = new ice.adapter(4001, 'localhost');

ice.create_object_factory('printer.ice', function(error, defs) {
    var printer_x = defs.Demo.Printer();
    adapter.publish_object({name: 'X', category: null}, printer_x);
    printer_x.on('printString', function(response, s) {
        console.log("X.printString(\"" + s + "\")");
        response.send();
    })
    printer_x.on('ice_isA', function(response, s) {
        if (s == printer_x.obj_name) {
            response.send(1);
        } else {
            response.send(0);
        }
    })
});

adapter.activate(function() {
    console.log('Started listening!');
});
