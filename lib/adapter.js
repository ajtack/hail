var EventEmitter = require('events').EventEmitter;
var MessageReceiver = require('./messages').Receiver;
var OperationParser = require('./operations').Parser;
var inherits     = require('util').inherits;
var _            = require('underscore');

var Adapter = function(port, host)
{
    if (this instanceof Adapter) {
        EventEmitter.call(this);
        this.port = port;
        this.host = host;
        this.servants = {};
    } else {
        return new Adapter(port, host);
    }
};
inherits(Adapter, EventEmitter);
exports.Adapter = Adapter;


/*!
 * Makes the object identified by object_id (which may either be a string, meaning {name: <string>,
 * category: null} or an object filling at least the name property) available to connecting
 * clients. If the adapter is active, the user must take care to define event handlers for all
 * of the salient events for this object.
 */
Adapter.prototype.publish_object = function(object_id, servant) {
    if (object_id instanceof String)
        object_id = {name: object_id};

    if (!! _.has(object_id, 'name')) {
        _.defaults(object_id, {category: null});
        servant.facets = [];
        this.servants[object_id] = servant;
        return servant;
    } else {
        throw new Error('Published object with identity ' + object_id + ' is not the right type.');
    }
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
            // object_id, facet, operation_name, arguments
            self.operations_parser.on('operation', function(request, stream) {
                if (request.object_id in self.servants) {
                    var servant = self.servants[request.object_id];
                    if (request.facet !== null) {
                        if (request.facet in servant.facets) {
                            console.log('Unprepared for facets...', request.object_id, request.facet);
                        } else {
                            console.log('No facet "' + request.facet + '" for object ' + JSON.stringify(request.object_id));
                        }
                    } else {
                        servant.apply(request.operation, request.params, stream, request.request_id);
                    }
                } else {
                    console.log('No such object "' + request.object_id.name + '"! Throw ObjectNotExistException!');
                }
            });
        }

        on_start(error);
    });
};
