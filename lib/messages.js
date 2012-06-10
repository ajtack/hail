var binary       = require('binary');
var buffer       = require('buffer');
var EventEmitter = require('events').EventEmitter;
var net          = require('net');
var inherits     = require('util').inherits;

/*!
 * Yields an event emitter which will yield the following:
 *   - 'request', header, body
 *   - 'batch request', header, body
 *   - 'reply', header, body
 *   - 'connection validation', header, body
 *   - 'close connection', header, body
 */
var Receiver = function() {
    if (this instanceof Receiver) {
        EventEmitter.call(this);
        var receiver = this;
        this.server = net.createServer();
        this.server.on('connection', function(socket) {
            socket.write(ConnectionValidation)
            new Parser(receiver, socket);
        });
    } else {
        return new Receiver();
    }
};
inherits(Receiver, EventEmitter);
exports.Receiver = Receiver;


/*!
 * Presents the exact same listening interface as net.server.listen.
 */
Receiver.prototype.listen = function(port, host, on_listening) {
    this.server.listen(port, host, on_listening);
};


const ice_message_header_length = 14;

/*!
 * Applied to an emitter and a unique connection, emits indefinitely the messages received over
 * that connection.
 */
var Parser = function(emitter, stream) {
    if (this instanceof Parser) {
        current_header = null;

        var parse_new_message = function (parser) {
            parser  .buffer  ('header.magic', 4)
                    .word8le ('header.protocol_major')
                    .word8le ('header.protocol_minor')
                    .word8le ('header.encoding_major')
                    .word8le ('header.encoding_minor')
                    .word8le ('header.message_type_code')
                    .word8le ('header.compression')
                    .word32le('length')
                    .tap(function(message) {
                        if (message.header.magic == "IceP") {
                            delete message.header.magic;
                            message.header.message_type = stringified_message_type(message.header.message_type_code);
                            this.buffer('body', message.length - ice_message_header_length)
                                .tap(function(message) {
                                    emitter.emit(message.header.message_type, stream, message.header, message.body);
                                    this.flush();
                                    parse_new_message(this);
                                });
                        } else {
                            throw new Error('Ice Protocol has been ruptured.');
                        }
                    });
        };

        var message_parser = binary();
        parse_new_message(message_parser);
        stream.pipe(message_parser);
    } else {
        return new Parser(emitter, stream);
    }
}


var ConnectionValidation = new buffer.Buffer(14);
ConnectionValidation.write('IceP');                 // magic
ConnectionValidation.writeUInt8(1, 4);              // Protocol Major version
ConnectionValidation.writeUInt8(0, 5);              // Protocol Minor version
ConnectionValidation.writeUInt8(1, 6);              // Encoding Major version
ConnectionValidation.writeUInt8(0, 7);              // Encoding Minor version
ConnectionValidation.writeUInt8(3, 8);              // "Connection Validation" Type
ConnectionValidation.writeUInt8(0, 9);              // Compression type (always zero for validation)
ConnectionValidation.writeUInt32LE(ice_message_header_length, 10);


var stringified_message_type = function(integer) {
    switch (integer) {
        case 0: return 'request';
        case 1: return 'batch request';
        case 2: return 'reply';
        case 3: return 'validate connection';
        case 4: return 'close connection';

        default:
            throw new Error('Ice message type ' + integer + ' is not known!');
    };
};
