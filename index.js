var fs = require('fs');
var generate_parser = require('jison').Parser
var ice_types = require('./lib/slice/types');
var Servant = require('./lib/servant').Servant;
var adapter = require('./lib/adapter').Adapter;
var _ = require('underscore');
const ice_object_file = 'lib/slice/object.ice';

var create_object_factory = function create_object_factory(ice_filename, callback) {
    var ice_definitions = null;
    var obj_name = null;
    fs.readFile('lib/slice/grammar.jison', 'utf-8', function(error, raw_grammar) {
        var parse_slice = generate_parser(raw_grammar);
        parse_slice.yy = ice_types;
        fs.readFile(ice_object_file, 'utf-8', function(error, ice_file) {
            if (!error) {
                base_ice_object_definition = parse_slice.parse(ice_file)['Object'];
                fs.readFile(ice_filename, 'utf-8', function(error, slice_file) {
                    if (! error) {
                        // TODO: Parse errors?!
                        var parsed_definitions = parse_slice.parse(slice_file);
                        var type_hierarchy_namespace = '';
                        var type_hierarchy = define_with_constructors(parsed_definitions, type_hierarchy_namespace);
                        callback(error, type_hierarchy)
                    } else {
                        callback(error, undefined);
                    }                
                });
            } else {
                callback(error, undefined);
            }
        });
    });

    var complete_operation_set = function(interface_def) {
        _.extend(interface_def['operations'], base_ice_object_definition['operations']);
        return interface_def;
    };

    var define_with_constructors = function(local_definition, root_name) {
        if (_.has(local_definition, 'operations')) {
            var interface_definition = complete_operation_set(local_definition);
            return function() { 
                var servant = new Servant(interface_definition);
                servant.obj_name = root_name;
                return servant;
            };
        } else {
            var apply_inner_definitions = function(module, inner_definitions, this_name) {
                fully_qualified_name = root_name + "::" + this_name;
                module[this_name] = define_with_constructors(inner_definitions, fully_qualified_name);
                return module;
            };
            return _.foldl(local_definition, apply_inner_definitions, {});
        }
    };
};
exports.create_object_factory = create_object_factory;

exports.adapter = adapter;
