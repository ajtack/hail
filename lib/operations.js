var EventEmitter = require('events').EventEmitter;
var ice_binary = require('./ice_binary');
var inherits     = require('util').inherits;

/*!
 * Yields an event emitter which will yield the following:
 *   - 'operation': #object{name, category}, facet, operation_name, unparsed_arguments
 */
var Parser = function(message_receiver) {
    if (this instanceof Parser) {
        EventEmitter.call(this);
        this.message_receiver = message_receiver;

        var self = this;
        this.message_receiver.on('request', function(header, body) {
            var operation_parser = ice_binary(body)
                    .word32le ('request_id')
                    .ice_struct('object_id', function() {
                        this.ice_string('name');
                        this.ice_string('category');
                    })
                    .ice_sequence('facet', function() {
                        this.ice_string('name');
                    })
                    .ice_string('operation')
                    .word8('mode')
                    .ice_dictionary('context', function() { }, function() { })   // Unimplemented!
                    .ice_encapsulation('params')
                    .tap(function(r) {
                        var facet = r.facet.length > 0? r.facet[0].name : null;
                        self.emit('operation', r.object_id, facet, r.operation.toString(), r.params);
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
        return new Parser(message_receiver);
    }
};
inherits(Parser, EventEmitter);
exports.Parser = Parser;


var requests_logged = [];
function log_request(type, header, body) {
    console.log(type);
    console.log("H: " + JSON.stringify(header));
    console.log("B: " + body.toString('hex'));
}
