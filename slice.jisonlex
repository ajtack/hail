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
