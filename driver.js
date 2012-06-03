var ice_adapter = require('./adapter').Adapter;

var adapter = new ice_adapter(4001, 'localhost');
adapter.activate(function() {
    console.log('Started listening!');
});
