var EventEmitter = require('events').EventEmitter;
var OperationDispatcher = require('./operation_dispatch').OperationDispatcher;
var inherits     = require('util').inherits;

var Adapter = function()
{
    if (this instanceof Adapter) {
        EventEmitter.call(this);
        this.message_receiver = OperationDispatcher();

        // ???
    } else {
        return new Adapter;
    }
};
inherits(Adapter, EventEmitter);
exports.Adapter = Adapter;


/*!
 * IceAdapter::activate
 */
Adapter.prototype.activate = function(port, host, on_start) {
    this.message_receiver.listen(port, host, on_start);
};
