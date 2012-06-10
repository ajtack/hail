var ice = require('./index');

var adapter = new ice.adapter(4001, 'localhost');

ice.create_object_factory('printer.ice', function(error, defs) {
    var printer_x = defs.Demo.Printer();
    adapter.publish_object({name: 'X', category: null}, printer_x);
    printer_x.on('printString', function(s) {
        console.log("X.printString(\"" + s + "\")");
    })
});

adapter.activate(function() {
    console.log('Started listening!');
});
