var buffer       = require('buffer');
var buffers      = require('buffers');
var buffer       = require('buffer')
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

        var buffered_data = buffers();
        stream.on('data', function(new_data) {
            buffered_data.push(new_data);
            process_incoming_data(emitter, buffered_data, current_header);
        });
    } else {
        return new Parser(emitter, stream);
    }
}


function process_incoming_data(emitter, buffered_data, current_header) {
    if (current_header == null && buffered_data.length >= ice_message_header_length) {
        if (contains_valid_header(buffered_data)) {
            current_header = MessageHeader.parse_from(buffered_data.slice(0, ice_message_header_length));

            // In case this was a zero-length message or if the entire message arrived all at once…
            var more_data_available = (buffered_data.length > ice_message_header_length);
            if (current_header.body_length == 0 || more_data_available)
                process_incoming_data(emitter, buffered_data, current_header);
        } else {
            throw new Error('Ice Protocol has been ruptured.');
            stream.end();
        }
    } else if (current_header != null && buffered_data.length >= current_header.body_length) {
        // TODO: Compression. The situation with compression libraries kinda sucks;
        // none of them compile.
        //
        var raw_body = buffered_data.slice(ice_message_header_length, current_header.body_length);
        var remaining_data = buffered_data.slice(ice_message_header_length + current_header.body_length);
        emitter.emit(current_header.message_type, current_header, raw_body);

        // Clear and wait for a new message
        current_header = null;
        buffered_data = buffers([remaining_data]);
    } else {
        console.log("Waiting for data!");
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


function contains_valid_header(data) {
    if (data.length >= ice_message_header_length) {
        var magic = data.toString('ascii', 0, 4);
        return magic == 'IceP';
    } else {
        return false;
    }
};


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


/*!
 * A prototypical object wrapping specifically message header information.
 */
var MessageHeader = function()
{
    if (! (this instanceof MessageHeader))
        return new MessageHeader;
};


MessageHeader.parse_from = function(data) {
    if (! contains_valid_header(data)) {
        throw new Error('Tried to parse an invalid Ice message!');
    } else {
        var message = new MessageHeader;
        message.message_type = stringified_message_type(data.readUInt8(8));
        message.compression_mode = data.readUInt8(9);
        message.body_length = data.readUInt32LE(10);
        return message;
    }
}
