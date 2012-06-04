var fs = require('fs');
var generate_parser = require('jison').Parser
var ice_types = require('./slice/types');

fs.readFile('slice/grammar.jison', 'utf-8', function(error, raw_grammar) {
	var parse_slice = generate_parser(raw_grammar);
	parse_slice.yy = ice_types;
	fs.readFile('slice/object.ice', 'utf-8', function(error, slice_file) {
		var parsed_modules = parse_slice.parse(slice_file);
		console.log(parsed_modules);
	});
	fs.readFile('printer.ice', 'utf-8', function(error, slice_file) {
		var parsed_modules = parse_slice.parse(slice_file);
		console.log(parsed_modules);
	});
});
