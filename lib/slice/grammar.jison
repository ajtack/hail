%lex
identifier                  [a-zA-Z]([a-zA-Z0-9]|"_"[a-zA-Z0-9])*

%%
\s+                         /* skip whitespace */
"{"                         return 'LEFT_BRACE';
"}"                         return 'RIGHT_BRACE';
"["                         return 'LEFT_BRACKET';
"]"                         return 'RIGHT_BRACKET';
"("                         return 'LEFT_PARENTHESIS';
")"                         return 'RIGHT_PARENTHESIS';
"<"                         return 'LEFT_ALLIGATOR';
">"                         return 'RIGHT_ALLIGATOR';
";"                         return 'SEMICOLON';
"\""                        return 'QUOTE'
","                         return 'COMMA';
"out"                       return 'OUT_PARAMETER_KEYWORD';
"bool"                      return 'TYPE_BOOL';
"string"                    return 'TYPE_STRING';
"int"                       return 'TYPE_INT';
"void"                      return 'TYPE_VOID';
"idempotent"                return 'IDEMPOTENT_KEYWORD';
"interface"                 return 'INTERFACE_KEYWORD';
"module"                    return 'MODULE_KEYWORD';
"sequence"                  return 'SEQUENCE_TEMPLATE';
"dictionary"                return 'DICTIONARY_TEMPLATE';
{identifier}                return 'IDENTIFIER';
<<EOF>>                     return 'END_OF_FILE';

/lex

%%

file
    : module_children END_OF_FILE
        {   $$ = {};
            for (var child_id in $module_children) {
                var child = $module_children[child_id];
                $$[child.name] = child.body;
            }
            return $$;
        }
    ;

module_children
    : module               module_children
        {   $module_children.unshift($1);
            $$ = $module_children;
        }
    | qualified_interface  module_children
        {   $module_children.unshift($1);
            $$ = $module_children;
        }
    | type_definition      module_children
        -> $module_children;
    | /* end of sequence */
        -> [];
    ;

module
    : MODULE_KEYWORD IDENTIFIER LEFT_BRACE module_children RIGHT_BRACE SEMICOLON
        {   $$ = {name: $IDENTIFIER, body: {}};
            for (var child_id in $module_children) {
                var child = $module_children[child_id];
                $$.body[child.name] = child.body;
            };
        }
    ;

qualified_interface
    /* We currently don't care about metadata. Ignored. */
    : interface
    | metadata_block interface
        -> $interface;
    ;

interface
    : INTERFACE_KEYWORD IDENTIFIER LEFT_BRACE operations RIGHT_BRACE SEMICOLON
        {   $$ = {name: $IDENTIFIER, body: {operations: {}}};
            for (var operation_index in $operations) {
                var operation = $operations[operation_index];

                // TODO: Duplicate detection in $$.operations.
                $$.body.operations[operation.name] = {arguments: $operation.arguments, returns: $operation.returns};
            }
        }
    ;

operations
    : qualified_operation operations
        {   $operations.unshift($qualified_operation);
            $$ = $operations;
        }
    | /* end of sequence */
        -> [];
    ;

qualified_operation
    /* We thus far don't care about idempotence. Ignored. */
    : operation
    | IDEMPOTENT_KEYWORD operation
        -> $operation;

    /* We thus far don't care about metadata. Ignored. */
    | metadata_block operation
        -> $operation;
    | metadata_block IDEMPOTENT_KEYWORD operation
        -> $operation;
    ;

operation
    : typename IDENTIFIER LEFT_PARENTHESIS argument_declarations RIGHT_PARENTHESIS SEMICOLON
        -> {name: $IDENTIFIER, arguments: $argument_declarations, returns: {result_type: $typename, output_parameters: []}};
    ;

type_definition
    : SEQUENCE_TEMPLATE LEFT_ALLIGATOR typename RIGHT_ALLIGATOR IDENTIFIER SEMICOLON
        {   if ($IDENTIFIER in yy.type_definitions) {
                $$ = 'wtf sequence';
                // Error?
            } else {
                yy.type_definitions[$IDENTIFIER] = yy.SequenceType($typename);
                $$ = yy.type_definitions[$IDENTIFIER];  // Unnecessary?
            }
        }
    | DICTIONARY_TEMPLATE LEFT_ALLIGATOR typename COMMA typename RIGHT_ALLIGATOR IDENTIFIER SEMICOLON
        {   if ($IDENTIFIER in yy.type_definitions) {
                $$ = 'wtf dictionary';
                // Error?
            } else {
                yy.type_definitions[$IDENTIFIER] = yy.DictionaryType($typename1, $typename2);
                $$ = yy.type_definitions[$IDENTIFIER];  // Unnecessary?
            }
        }
    ;

metadata_block
    : LEFT_BRACKET metadata RIGHT_BRACKET
        -> $metadata;
    ;

metadata
    : metadatum COMMA metadata
        -> $metadatum;
    | metadatum
    ;

metadatum
    : QUOTE IDENTIFIER QUOTE
        -> $IDENTIFIER;
    ;

argument_declarations
    : argument_declaration argument_declarations
        {   $argument_declarations.unshift($argument_declaration);
            $$ = $argument_declarations;
        }
    | /* end of sequence */
        -> [];
    ;

argument_declaration
    : typename IDENTIFIER
        -> {type: $typename, name: $IDENTIFIER}
    | metadata_block typename IDENTIFIER
        -> {type: $typename, name: $IDENTIFIER}
    ;

typename
    : TYPE_BOOL
    | TYPE_STRING
    | TYPE_INT
    | TYPE_VOID
    | user_defined_typename
        -> $1;
    ;

user_defined_typename
    : IDENTIFIER
        {   if ($IDENTIFIER in yy.type_definitions) {
                $$ = yy.type_definitions[$IDENTIFIER];
            } else {
                // ERROR?!?!?
                $$ = 'wtf type is ' + $IDENTIFIER;
            }
        }
    ;
