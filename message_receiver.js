var binary       = require('binary');
var buffer       = require('buffer');
var buffers      = require('buffers');
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


/*!
 * Applied to an emitter and a unique connection, emits indefinitely the messages received over
 * that connection.
 */
var Parser = function(emitter, stream) {
    if (this instanceof Parser) {
        current_header = null;

        var begin_parsing_new_message = function (binary_parser) {
            const ice_message_header_length = 14;
            binary_parser
                    .buffer  ('header.magic', 4)
                    .word8le ('header.protocol_major')
                    .word8le ('header.protocol_minor')
                    .word8le ('header.encoding_major')
                    .word8le ('header.encoding_minor')
                    .word8le ('header.message_type_code')
                    .word8le ('header.compression')
                    .word32le('length')
                    .loop(function(end_parsing, message) {
                        if (message.header.magic == "IceP") {
                            message.header.magic = message.header.magic.toString();
                            message.header.message_type = stringified_message_type(message.header.message_type_code);
                            console.log(JSON.stringify(message.header));
                            this.buffer('body.data', message.length - ice_message_header_length)
                                .loop(function(end_parsing, message) {
                                    console.log(message.body.data.toString('hex'));
                                    emitter.emit(message.header.message_type, message.header, message.body.data);
                                    begin_parsing_new_message(this);
                                });
                        } else {
                            throw new Error('Ice Protocol has been ruptured.');
                            end_parsing();
                        }
                    });
        };

        var message_parser = binary();
        begin_parsing_new_message(message_parser);
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
