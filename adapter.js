var EventEmitter = require('events').EventEmitter;
var MessageReceiver = require('./messages').Receiver;
var OperationParser = require('./operations').Parser;
var inherits     = require('util').inherits;

var Adapter = function(port, host)
{
    if (this instanceof Adapter) {
        EventEmitter.call(this);
        this.port = port;
        this.host = host;
        this.objects = {};
    } else {
        return new Adapter;
    }
};
inherits(Adapter, EventEmitter);
exports.Adapter = Adapter;


/*!
 * IceAdapter::activate
 */
Adapter.prototype.activate = function(on_start) {
    var self = this;
    message_receiver = MessageReceiver();
    message_receiver.listen(this.port, this.host, function(error) {
        if (!error) {
            self.operations_parser = OperationParser(message_receiver);
            self.operations_parser.on('operation', function(object_id, facet, operation_name, arguments) {
                if (object_id in self.objects)
                    console.log('Trying to dispatch ' + object_id.name + '.' + operation_name + '(...)');
                else
                    console.log('No such object "' + object_id.name + '"! Throw ObjectNotExistException!');
            });
        }

        on_start(error);
    });
};
