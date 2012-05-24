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
";"                         return 'SEMICOLON';
"\""                        return 'QUOTE'
","                         return 'COMMA';
"out"                       return 'OUT_PARAMETER_KEYWORD';
"string"                    return 'TYPE_STRING';
"int"                       return 'TYPE_INT';
"void"                      return 'TYPE_VOID';
interface                   return 'INTERFACE_KEYWORD';
module                      return 'MODULE_KEYWORD';
{identifier}                return 'IDENTIFIER';
<<EOF>>                     return 'END_OF_FILE';

/lex

%%

file
    : module END_OF_FILE
        {   $$ = {};
            $$[$module.name] = $module.body;
            return $$;
        }
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

interface
    : INTERFACE_KEYWORD IDENTIFIER LEFT_BRACE operations RIGHT_BRACE SEMICOLON
        {   $$ = {name: $IDENTIFIER, body: {}};
            for (var operation_index in $operations) {
                var operation = $operations[operation_index];
                $$.body[operation.name] = {arguments: $operation.arguments, returns: $operation.returns};
            }
        }
    ;

interface_with_metadata
    : metadata_block interface
        -> $interface;
    ;

metadata_block
    : LEFT_BRACKET metadata RIGHT_BRACKET
        -> $metadata;
    ;

metadata
    : metadatum COMMA metadata
        -> $metadatum;
    | metadatum
        -> $metadatum;
    ;

metadatum
    : QUOTE IDENTIFIER QUOTE
        -> $IDENTIFIER;
    ;

operations
    : operation operations
        {   $operations.unshift($operation);
            $$ = $operations;
        }
    | metadata_block operation operations
        {   $operations.unshift($operation);
            $$ = $operations;
        }
    | /* end of sequence */
        -> [];
    ;

operation
    : typename IDENTIFIER LEFT_PARENTHESIS argument_declarations RIGHT_PARENTHESIS SEMICOLON
        -> {name: $IDENTIFIER, arguments: $argument_declarations, returns: {result_type: $typename, output_parameters: []}};
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
    ;

typename
    : TYPE_STRING
    | TYPE_INT
    | TYPE_VOID
    ;

module_children
    : module                    module_children
        {   $module_children.unshift($1);
            $$ = $module_children;
        }
    | interface                 module_children
        {   $module_children.unshift($1);
            $$ = $module_children;
        }
    | interface_with_metadata   module_children
        {   $module_children.unshift($1);
            $$ = $module_children;
        }
    | /* end of sequence */
        -> [];
    ;
