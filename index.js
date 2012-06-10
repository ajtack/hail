var fs = require('fs');
var generate_parser = require('jison').Parser
var ice_types = require('./lib/slice/types');
var Servant = require('./lib/servant').Servant;
var adapter = require('./lib/adapter').Adapter;
var _ = require('underscore');

var create_object_factory = function create_object_factory(ice_filename, callback) {
    fs.readFile('lib/slice/grammar.jison', 'utf-8', function(error, raw_grammar) {
        var parse_slice = generate_parser(raw_grammar);
        parse_slice.yy = ice_types;
        fs.readFile(ice_filename, 'utf-8', function(error, slice_file) {
            if (! error) {
                // TODO: Parse errors?!
                var parsed_definitions = parse_slice.parse(slice_file);
                var define_with_constructors = function(definition) {
                    if (_.has(definition, 'operations')) {
                        return function() { return new Servant(definition); };
                    } else {
                        return _.foldl(definition, function(module, value, this_key) {
                            var complete_definition = {};
                            complete_definition[this_key] = define_with_constructors(value);
                            return _.extend(module, complete_definition);
                        }, {});
                    }
                };
                var type_hierarchy = define_with_constructors(parsed_definitions);
                callback(error, type_hierarchy);
            } else {
                callback(error, undefined);
            }
        });
    });
};
exports.create_object_factory = create_object_factory;

exports.adapter = adapter;
