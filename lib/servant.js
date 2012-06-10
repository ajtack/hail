var EventEmitter = require('events').EventEmitter;
var ice_binary_parser = require('./ice_binary/parser');
var inherits     = require('util').inherits;
var response = require('./response');
var _ = require('underscore');

var Servant = function(definition) {
    if (this instanceof Servant) {
        this.operations = definition.operations;
    } else {
        return new Servant(definition);
    }
};
inherits(Servant, EventEmitter)
exports.Servant = Servant;


Servant.prototype.apply = function(operation_name, argument_encapsulation, stream, request_id) {
    if (operation_name in this.operations) {
        var argument_definitions = this.operations[operation_name].arguments;
        var parser = ice_binary_parser(argument_encapsulation.body);
        for (argument_id in argument_definitions) {
            var this_argument_definition = argument_definitions[argument_id];
            switch (this_argument_definition.type) {
            case 'string':
                parser.ice_string(this_argument_definition.name);

            // TODO: there are other types, ya jerk.
            };
        }

        var emitter = this;

        // TODO: We need to handle output parameters as well.
        var return_type = this.operations[operation_name].returns.result_type;
        var resp = response(stream, request_id, return_type);

        parser.tap(function(arguments) {
            var push_back = function(list, value, name) { list.push(value); return list; };
            var emit_params = _.foldl(arguments, push_back, [operation_name, resp]);
            emitter.emit.apply(emitter, emit_params);
        });
    } else {
        // Throw not implemented exception? I don't know.
        console.log(operation_name, this.operations);
    }
};
