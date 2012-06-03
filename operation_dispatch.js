var EventEmitter = require('events').EventEmitter;
var MessageReceiver = require('./messages').Receiver;
var ice_binary = require('./ice_binary');
var inherits     = require('util').inherits;

/*!
 * Yields an event emitter which will yield the following:
 *   - 'user_operation': object_name, operation_name, unparsed_arguments
 *   - 'existence_check': object_name
 */
var OperationDispatcher = function() {
    if (this instanceof OperationDispatcher) {
        EventEmitter.call(this);
        this.message_receiver = MessageReceiver();

        this.message_receiver.on('request', function(header, body) {
            log_request('Request', header, body);
            var operation_parser = ice_binary(body)
                    .word32le ('request_id')
                    .ice_struct('id', function() {
                        this.ice_string('name');
                        this.ice_string('category');
                    })
                    .ice_sequence('facet', function() {
                        this.ice_string('id');
                    })
                    .ice_string('operation')
                    .word8('mode')
                    .tap(function(vars) {
                        console.log(vars);
                    });
        });

        this.message_receiver.on('batch_request', function(header, body) {
            log_request('Batch', header, body);
        });

        this.message_receiver.on('reply', function() {
            log_request('Reply', header, body);
        });

        this.message_receiver.on('connection validation', function(header, body) {
            log_request('Validation', header, body);
        });

        this.message_receiver.on('close', function(header, body) {
            log_request('Closure', header, body);
        });

        this.message_receiver.on('error', function(what) {
            console.log(what);
        });
    } else {
        return new OperationDispatcher();
    }
};
inherits(OperationDispatcher, EventEmitter);
exports.OperationDispatcher = OperationDispatcher;


OperationDispatcher.prototype.listen = function(port, host, on_start) {
    this.message_receiver.listen(port, host, on_start);
};


function parsed_request(request) {
    var request_id = request.readUInt32LE(0);
    var ice_id = 0;
}


function emit_request_to_servant(request, emitter) {
    var parsed_request
    if (parsed_request = parse_request(request)) {
        
    } else {
        console.error("Rejected request for badly-formed request.")
        // TODO: Unmarshalling error? What should the server do?
    }
    console.log("Received " + request.toString('hex'));
}

var requests_logged = [];
function log_request(type, header, body) {
    console.log(type);
    console.log("H: " + JSON.stringify(header));
    console.log("B: " + body.toString('hex'));

    requests_logged.push({'header': header, 'body': body});
    console.log(requests_logged);
}
