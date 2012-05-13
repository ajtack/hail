var ice_adapter = require('./adapter').Adapter;

var adapter = new ice_adapter();
adapter.activate(4001, "localhost", function() {
    console.log('Started listening!');
});
