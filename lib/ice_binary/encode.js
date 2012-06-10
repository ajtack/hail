var buffer  = require('buffer');
var buffers = require('buffers');

/*!
 * Compute length of UTF-8 serialization of string s.
 * (from http://stackoverflow.com/questions/8588449)
 */
function utf8_length(s)
{
    var l = 0;
    for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c <= 0x007f) l += 1;
        else if (c <= 0x07ff) l += 2;
        else if (c >= 0xd800 && c <= 0xdfff)  l += 2;  // surrogates
        else l += 3;
    }
    return l;
}

/*!
 * Produces a buffer containing the encoding for an Ice string.
 */
exports.ice_string = function encode_ice_string(s) {
	var encoded_bytes = new buffer(utf8_length(s) + 5);   // Make space for all size encodings.
	if (utf8_length(s) < 255) {
		encoded_string.writeUInt8(utf8_length(s), 0);
		encoded_string.write(s, 1);
		return encoded_string.slice(1 + utf8_length(s));
	} else {
		encoded_string.writeUInt8(255, 0);
		encoded_string.writeUInt32LE(utf8_length(s), 1);
		encoded_string.write(s, 5);
		return encoded_string;
	}
};


exports.ice_int = function encode_ice_int(n) {
	var encoded_bytes = new buffer(4);
	encoded_bytes.writeInt32(n);
}
