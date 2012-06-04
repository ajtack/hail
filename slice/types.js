var SequenceType = function(element_type) {
	if (this instanceof SequenceType) {
		this.element_type = element_type;
	} else {
		return new SequenceType(element_type);
	}
};
exports.SequenceType = SequenceType;


var DictionaryType = function(key_type, value_type) {
	if (this instanceof DictionaryType) {
		this.key_type = key_type;
		this.value_type = value_type;
	} else {
		return new DictionaryType(key_type, value_type);
	}
};
exports.DictionaryType = DictionaryType;


var Interface = function(name, operations) {
	if (this instanceof Interface) {

	} else {
		return new Interface(name, operations);
	}
};
exports.Interface = Interface;


exports.type_definitions = {};
