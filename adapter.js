var EventEmitter = require('events').EventEmitter;
var MessageReceiver = require('./message_receiver').Receiver;
var inherits     = require('util').inherits;

var Adapter = function()
{
    if (this instanceof Adapter) {
        EventEmitter.call(this);
        this.message_receiver = MessageReceiver();

        var adapter = this;
        this.message_receiver.on('request', function(header, body) {
            // emit_request_to_servant(body, adapter)
            log_request('Request', header, body);
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


// struct RequestData {
//     int requestId;
//     Ice::Identity id;
//     Ice::StringSeq facet;
//     string operation;
//     byte mode;
//     Ice::Context context;
//     Encapsulation params;
// };
function parsed_request(request) {
    var request_id = request.readUInt32LE(0);
    var ice_id
}


function emit_request_to_servant(request, emitter) {
    var parsed_request
    if (parsed_request = parse_request(request)) {
        // ...
    }
    console.log("Received " + request.toString('hex'));
}


function log_request(type, header, body) {
    console.log(type);
    console.log("H: " + JSON.stringify(header));
    console.log("B: " + body.toString());
}
