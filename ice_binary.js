var binary       = require('binary');
var inherits     = require('util').inherits;
var _ = require("underscore");

var ice_binary = function(buffer) {
    if (this instanceof ice_binary) {
        this.buffer_ = buffer;
        this.parser = binary.parse(buffer);
        _.extend(this.parser, this);     // Really? What a pain in the ass...
        return this.parser;
    } else {
        return new ice_binary(buffer);
    }
};
exports = module.exports = ice_binary;


ice_binary.prototype.ice_string = function(name) {
    string_size_name = name + '.size';
    this.ice_size(string_size_name)
        .buffer(name, string_size_name);
    return this;
};


ice_binary.prototype.ice_size = function(name) {
    this.word8(name)
        .tap(function(result) {
            if (result[name] != null && result[name] > 255)
                this.word32le(name);
        });

    return this;
}



ice_binary.prototype.ice_struct = function(name, block) {
    // Structs are incredibly simple: we just give all the variables a namespace as the name
    // of that struct.
    return this.into(name, block);
};


ice_binary.prototype.ice_sequence = function(name, content) {
    var result_sequence = Array();
    this.vars[name] = result_sequence;

    var sequence_length_key = name + '.expected_length';    // Delete this associative key later.
    this.ice_size(sequence_length_key)
        .tap(function(top_vars) {
            var remaining_elements = top_vars[name]['expected_length'];
            delete top_vars[name]['expected_length'];
            if (remaining_elements !== null && remaining_elements >= 0) {
                while (remaining_elements > 0) {
                    this.into('next_parsed', function(top) {
                        content.call(this);
                    }).tap(function(the) {
                        result_sequence.push(the.next_parsed);
                        delete the.next_parsed;
                    });

                    --remaining_elements;
                }
            } else {
                // Could not parse this sequence!
                this.vars[name] = null;
            }
        });

    return this;
};


ice_binary.prototype.ice_dictionary = function(name, parse_key_format, parse_value_format) {
    var kv_pair_count = name + '.expected_pair_count';    // Delete this associative key later.
    this.ice_size(kv_pair_count)
        .tap(function(vars) {
            var remaining_elements = vars[name]['expected_pair_count'];
            delete vars[name]['expected_pair_count'];
            if (remaining_elements !== null && remaining_elements >= 0) {
                while (remaining_elements > 0) {
                    throw new Error("Cannot parse nonempty Ice Dictionaries (not yet implemented)");
                }
            } else {
                // Could not parse this dictionary!
                this.vars[name] = null;
            }
        });

    return this;
};


ice_binary.prototype.ice_encapsulation = function(name) {
    this.into(name, function(top) {
        this.word32le('size')
            .word8('major')
            .word8('minor')
            .tap(function(encapsulation) {
                if (encapsulation.size !== null && encapsulation.size >= 6) {
                    this.buffer('body', encapsulation.size - 6);
                } else {
                    // This encapsulation is janky. Parse fail.
                    this.vars[name].body = null;
                }
            });
    });

    return this;
};
