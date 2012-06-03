var binary       = require('binary');
var inherits     = require('util').inherits;
var _ = require("underscore");

var ice_binary = function(buffer) {
    if (this instanceof ice_binary) {
        this.parser = binary.parse(buffer);
        _.extend(this.parser, this);
        return this.parser;
    } else {
        return new ice_binary(buffer);
    }
};
exports = module.exports = ice_binary;


ice_binary.prototype.ice_struct = function(name, block) {
    return this.into(name, block);
};


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
