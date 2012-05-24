var fs = require('fs');
var generate_parser = require('jison').Parser

fs.readFile('slice.jison', 'utf-8', function(error, raw_grammar) {
	var parse_slice = generate_parser(raw_grammar);
	fs.readFile('printer.ice', 'utf-8', function(error, slice_file) {
		var parsed_modules = parse_slice.parse(slice_file);
		console.log(parsed_modules);
	});
});
