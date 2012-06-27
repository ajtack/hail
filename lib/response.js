var buffer  = require('buffer').Buffer;
var buffers = require('buffers');
var encode  = require('./ice_binary/encode');

/*!
 * A builder object that will send a properly-formatted response to an implicit request if all
 * fields are properly filled.
 */
var Response = function(socket, request_id, return_type_definition) {
    if (this instanceof Response) {
        this.return_type_definition = return_type_definition;
        this.request_id = request_id;
        this.socket = socket;
    } else {
        return new Response(socket, request_id, return_type_definition);
    }
};
exports = module.exports = Response;


function response_message_for(request_id, encapsulated_return_value) {
    const ice_message_header_length = 14;
    const reply_header_length = 5;

    var total_message_length =
              ice_message_header_length
            + reply_header_length
            + encapsulated_return_value.length;

    var message_header = new buffer(14);
    message_header.write('IceP');                 // magic
    message_header.writeUInt8(1, 4);              // Protocol Major version
    message_header.writeUInt8(0, 5);              // Protocol Minor version
    message_header.writeUInt8(1, 6);              // Encoding Major version
    message_header.writeUInt8(0, 7);              // Encoding Minor version
    message_header.writeUInt8(2, 8);              // "Reply" Type (2)
    message_header.writeUInt8(0, 9);              // Compression type (always zero for validation)
    message_header.writeUInt32LE(total_message_length, 10);

    var reply_header = new buffer(5);
    reply_header.writeInt32LE(request_id, 0);
    reply_header.writeUInt8(0, 4);  // 0 - "Success"

    var response = new buffers();
    response.push(message_header);
    response.push(reply_header);
    response.push(encapsulated_return_value);
    return response.toBuffer();
}


function encapsulation_for(b) {
    const encapsulation_header_length = 6;

    var header = new buffer(encapsulation_header_length);
    header.writeInt32LE(b.length + encapsulation_header_length, 0);
    header.writeUInt8(1, 4);              // Encoding Major version
    header.writeUInt8(0, 5);              // Encoding Minor version

    var encapsulation = new buffers();
    encapsulation.push(header);
    encapsulation.push(b);
    return encapsulation.toBuffer();
};


Response.prototype.send = function(object) {
    var self = this;
    function encapsulated_return_value(o) {
        if (self.return_type_definition == 'void') {
            return encapsulation_for(buffer(0));
        } else if (self.return_type_definition == 'int') {
            var encoded_integer = encode.ice_int(object);
            return encapsulation_for(encoded_integer);
        } else if (self.return_type_definition == 'bool') {
            var encoded_bool = encode.ice_bool(object);
            return encapsulation_for(encoded_bool);
        }else {
            throw new Error("Haven't implemented crazy types yet. Return integers, you fiend.");
        }
    };

    var body = encapsulated_return_value(object);
    self.socket.write(response_message_for(self.request_id, body));
};
