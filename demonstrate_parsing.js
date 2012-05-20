// Node: for the below to work, you need to run `jison slice.jison slice.jisonlex`
// I cannot figure out how properly to apply the parser at runtime. Seems janky.
//
var parser = require("./slice").parser;
var parsed_module = parser.parse("module Demo { interface Printer { [\"amd\"] void printString(string s); }; };");
console.log(parsed_module.Demo.Printer);
