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
        this.servants = {};
    } else {
        return new Adapter;
    }
};
inherits(Adapter, EventEmitter);
exports.Adapter = Adapter;


Adapter.prototype.publish_object = function(name, servant) {
    servant.facets = [];
    this.servants[name] = servant;
};


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
                if (object_id in self.servants) {
                    var servant = self.servants[object_id];
                    if (facet !== null) {
                        if (facet in servant.facets) {
                            console.log('Unprepared for facets...', object_id, facet);
                        } else {
                            console.log('No facet "' + facet + '" for object ' + JSON.stringify(object_id));
                        }
                    } else {
                        servant.apply(operation_name, arguments);
                    }
                } else {
                    console.log('No such object "' + object_id.name + '"! Throw ObjectNotExistException!');
                }
            });
        }

        on_start(error);
    });
};
