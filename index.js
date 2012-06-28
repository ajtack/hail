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
                ice_definitions = parse_slice.parse(ice_file);
                fs.readFile(ice_filename, 'utf-8', function(error, slice_file) {
                    if (! error) {
                        // TODO: Parse errors?!
                        var parsed_definitions = parse_slice.parse(slice_file);
                        var type_hierarchy = define_with_constructors(parsed_definitions);
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

    var ice_defines = function(definition) {
        var ice_type_hierarchy = _.foldl(ice_definitions, function(module, value) {
        return value;
        }, {});
        for(key in definition) {
            ice_type_hierarchy[key] = _.extend(definition[key], ice_type_hierarchy[key]);
        }
        return ice_type_hierarchy;
    };
    var define_with_constructors = function(definition) {
        if (_.has(definition, 'operations')) {
            definition = ice_defines(definition);
            return function() { 
                var servant = new Servant(definition);
                servant.obj_name = obj_name;
                obj_name = null;
                return servant;
            };
        } else {
            return _.foldl(definition, function(module, value, this_key) {
                var complete_definition = {};
                if (obj_name) {
                    obj_name += "::" + this_key ;
                } else {
                    obj_name = "::" + this_key;
                }
                complete_definition[this_key] = define_with_constructors(value);
                return _.extend(module, complete_definition);
                }, {});
        }
    };
};
exports.create_object_factory = create_object_factory;

exports.adapter = adapter;
