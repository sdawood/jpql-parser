/* jsonpathql parser */

/* Code blocks are inserted at the top of the generated module. */


/* enable EBNF grammar syntax */
%start JSON_PATH /* Define Start Production */
%% /* Define Grammar Productions */

JSON_PATH
    : DOLLAR                                              { yy.ast.unshift(); return yy.ast.yield(); }
    | ACTIVE_ROOT                                         { yy.ast.unshift(); return yy.ast.yield(); }
    | DOLLAR PATH_COMPONENTS                              { yy.ast.set($1); yy.ast.unshift(); return yy.ast.yield(); }
    | ACTIVE_ROOT PATH_COMPONENTS                         { yy.ast.set($1); yy.ast.unshift(); return yy.ast.yield(); }
    | LEADING_CHILD_MEMBER_EXPRESSION                     { yy.ast.unshift(); return yy.ast.yield(); }
    | LEADING_CHILD_MEMBER_EXPRESSION PATH_COMPONENTS     { yy.ast.set({ operation: 'member', scope: 'child', expression: $1.expression}); yy.ast.unshift(); return yy.ast.yield(); }
    | PATH_COMPONENTS                                     { return yy.ast.yield(); }
    ;

PATH_COMPONENTS
    : PATH_COMPONENT
    | PATH_COMPONENTS PATH_COMPONENT
    ;

PATH_COMPONENT
    : MEMBER_COMPONENT    { yy.ast.set(yy.ast.merge($1, { operation: 'member' })); yy.ast.push(); }
    | SUBSCRIPT_COMPONENT { yy.ast.set(yy.ast.merge($1, { operation: 'subscript' })); yy.ast.push(); }
    ;

NESTED_PATH_COMPONENT
    : MEMBER_COMPONENT    ->  [ yy.ast.merge($1, { operation: 'member' }) ]; /* don't push the branch into the level-1 expressions */
    | SUBSCRIPT_COMPONENT ->  [ yy.ast.merge($1, { operation: 'subscript' }) ];
    ;

MEMBER_COMPONENT
    : CHILD_MEMBER_COMPONENT      -> $1
    | DESCENDANT_MEMBER_COMPONENT -> $1
    ;

CHILD_MEMBER_COMPONENT
    : DOT MEMBER_EXPRESSION -> yy.ast.merge($2, { scope: 'child' });
    ;

LEADING_CHILD_MEMBER_EXPRESSION
    : MEMBER_EXPRESSION ->  yy.ast.set({ scope: 'child', operation: 'member' });
    ;

DESCENDANT_MEMBER_COMPONENT
    : DOT_DOT MEMBER_EXPRESSION ->  yy.ast.merge($2, { scope: 'descendant' });
    ;

MEMBER_EXPRESSION
    : STAR
    | ACTIVE_SCRIPT_EXPRESSION  -> $1
    | ACTIVE_REGEXP_EXPRESSION  -> $1
    | ACTIVE_FILTER_EXPRESSION  -> $1
    | IDENTIFIER                -> $1
    | SCRIPT_EXPRESSION         -> $1
    | INTEGER                   -> $1
    | END
    ;

/*
     * - subscript expression locks children into a subscript operation
     * - union is defaulted to child subscript or descendant subscript
     * - a single expression or branch is allowed to modify the scope only into descendant
     * - as a result:
     * book[..author] === book..[author] // single
     * book[..author..name] === book..[author..name] // branch
     * - simple union children miss out on operation and scope, since they are locked into the parent union expression with child subscript context
     * -
*/

SUBSCRIPT_COMPONENT
    : CHILD_SUBSCRIPT_COMPONENT         -> $1 /* branch hasn't been popped yet */
    | DESCENDANT_SUBSCRIPT_COMPONENT    -> $1
    ;

DESCENDANT_SUBSCRIPT_COMPONENT
    : DOT_DOT CHILD_SUBSCRIPT_COMPONENT -> yy.ast.merge($2, { scope: 'descendant' })
    ;

/*
 * TO ENABLE SUBSCRIPT NESTING, EVERY RULE FROM HERE DOWNWARD MUST RETURN $$ SINCE NESTED NODES GET POPED
 */

CHILD_SUBSCRIPT_COMPONENT
    : [ SUBSCRIPT ]                     -> $2.scope? $2 : yy.ast.merge($2, { scope: 'child' })
    ;

SUBSCRIPT
    : SUBSCRIPT_EXPRESSION_LIST {
        if ($1.length > 1) {
            $$ = yy.ast.node({ expression: { type: 'union', value: $1 } });
           } else {
            $$ = yy.ast.merge($1[0], { operation: 'subscript' });
           }
       }
    ;

SUBSCRIPT_EXPRESSION_LIST
    : SUBSCRIPT_EXPRESSION_LISTABLE -> [ $1 ]
    | SUBSCRIPT_EXPRESSION_LIST COMMA_TOKEN SUBSCRIPT_EXPRESSION_LISTABLE -> $1.concat($3)
    ;

/*
 * LISTABLEs are social, they share subscript space and repeat themselves as they wish
*/

SUBSCRIPT_EXPRESSION_LISTABLE
    : SUBSCRIPT_COMPONENT_EXPRESSION_LISTABLE  -> $1
    | SUBSCRIPT_SIMPLE_EXPRESSION_LISTABLE     -> $1
    | SUBSCRIPT_ACTIVE_EXPRESSION_LISTABLE     -> $1
    | DESCENDANT_MEMBER_COMPONENT     ->  yy.ast.merge($1, { scope: 'descendant' }) /* single descendant member can modify subscript component scope */
    ;

SUBSCRIPT_SIMPLE_EXPRESSION_LISTABLE
    : INTEGER           -> $1
    | STRING_LITERAL    -> $1
    | ReservedWord      -> $1
    | IDENTIFIER        -> $1
    ;

/** active listables always work on the owner of the subscript and extract a chunk of the owner or all of it */
SUBSCRIPT_ACTIVE_EXPRESSION_LISTABLE
    : DOLLAR                        -> $1
    | ACTIVE_ROOT                   -> $1
    | STAR                          -> $1
    | ACTIVE_REGEXP_EXPRESSION      -> $1
    | ACTIVE_SCRIPT_EXPRESSION      -> $1
    | ACTIVE_FILTER_EXPRESSION      -> $1
    | ACTIVE_SLICE                  -> $1
    | ARRAY_SLICE                   -> $1
    | SCRIPT_EXPRESSION             -> $1
    | FILTER_EXPRESSION             -> $1
    ;

SUBSCRIPT_COMPONENT_EXPRESSION_LISTABLE
    : SUBSCRIPT_EXPRESSION_NESTABLE -> $1
    ;

SUBSCRIPT_EXPRESSION_NESTABLE
    : SUBSCRIPT_SIMPLE_EXPRESSION_LISTABLE NESTED_PATH_COMPONENTS           { yy.ast.rollIntoParent($1, yy.ast.stashPop()); yy.ast.pop(); }
    | SUBSCRIPT_ACTIVE_EXPRESSION_LISTABLE NESTED_PATH_COMPONENTS           { yy.ast.rollIntoParent($1, yy.ast.stashPop()); yy.ast.pop(); }
    | DESCENDANT_MEMBER_COMPONENT NESTED_PATH_COMPONENTS                    { yy.ast.rollIntoParent(yy.ast.merge($1, { operation: 'member' }), yy.ast.stashPop()); yy.ast.pop(); }
    | SUBSCRIPT_COMPONENT NESTED_PATH_COMPONENTS                            { $$ = yy.ast.rollIntoParent(yy.ast.active_position(), [ yy.ast.merge($1, { operation: 'subscript' }) ].concat(yy.ast.stashPop())); yy.ast.pop(); }
    | CHILD_MEMBER_COMPONENT NESTED_PATH_COMPONENTS                         { $$ = yy.ast.rollIntoParent(yy.ast.active_position(), [ yy.ast.merge($1, { scope: 'child', operation: 'member' }) ].concat(yy.ast.stashPop())); yy.ast.pop(); }
    | SUBSCRIPT_COMPONENT                                                   { $$ = yy.ast.rollIntoParent(yy.ast.active_position(), [ yy.ast.merge($1, { operation: 'subscript' }) ]); yy.ast.pop(); } /* subscript didn't start a branch, descendant subscript component would change scope into 'descendant' if branch is alone in the list*/
    | CHILD_MEMBER_COMPONENT                                                { $$ = yy.ast.rollIntoParent(yy.ast.active_position(), [ yy.ast.merge($1, { scope: 'child', operation: 'member' }) ]); yy.ast.pop(); } /*child member didn't start a branch*/
    ;

NESTED_PATH_COMPONENTS
    : NESTED_PATH_COMPONENT                                                 { yy.ast.stashPush($1); $$ = yy.ast.stashClone(); } /* $1 is already an array */
    | NESTED_PATH_COMPONENTS NESTED_PATH_COMPONENT                          { yy.ast.stash($2), $$ = yy.ast.stashClone(); }
    ;

/*
 * Separating rules regarding which expressions can be listed inside subscript expression, from which expression can be a leading member of a nested subscript expression
 * WARNING: UNUSED using this rule introduce conflict in rules, it might be false alarm though
 */
SUBSCRIPT_EXPRESSION_NESTABLE_LEADING_MEMBER_EXPRESSION
    : SUBSCRIPT_SIMPLE_EXPRESSION_LISTABLE -> $1
    | SUBSCRIPT_ACTIVE_EXPRESSION_LISTABLE -> $1
    ;

DOLLAR
    : DOLLAR_TOKEN                                                          {
                                                                                $$ = { expression: { type: 'root', value: '$' } };
                                                                                yy.ast.node($$);
                                                                            }
    ;

ACTIVE_ROOT
    : ACTIVE_ROOT_TOKEN                                                     {
                                                                                $$ = { expression: { type: 'root|active', value:  String.fromCharCode(0x40) + '$' } };
                                                                                yy.ast.node($$);
                                                                            } /*jison uses '@' internaly to reference current context*/
    ;

STAR
    : STAR_TOKEN                                                            {
                                                                            	 $$ = { expression: { type: 'wildcard', value: $1 } }; yy.ast.node($$);
                                                                            }
    ;

SCRIPT_EXPRESSION
    : SCRIPT_EXPRESSION_TOKEN                                               {
                                                                            	 $$ = { expression: { type: 'script_expression', value: $1 } }; yy.ast.node($$);
                                                                            }
    ;

ACTIVE_SCRIPT_EXPRESSION
    : ACTIVE_SCRIPT_EXPRESSION_TOKEN                                        {
                                                                            	 $$ = { expression: { type: 'script_expression|active', value: '(' + $1.map.script + ')', active: $1} }; yy.ast.node($$);
                                                                            }
    ;

ACTIVE_FILTER_EXPRESSION
    : ACTIVE_FILTER_EXPRESSION_TOKEN                                        {
                                                                            	 $$ = { expression: { type: 'filter_expression|active', value: '(' + $1.filter.script + ')', active: $1} }; yy.ast.node($$);
                                                                            }
    ;


FILTER_EXPRESSION
    : FILTER_EXPRESSION_TOKEN                                               {
                                                                            	 $$ = { expression: { type: 'filter_expression', value: $1 } }; yy.ast.node($$);
                                                                            }
    ;

ACTIVE_SLICE
    : ACTIVE_SLICE_TOKEN                                                    {
                                                                            	 $$ = { expression: { type: 'slice|active', value: $1 } }; yy.ast.node($$);
                                                                            }
    ;

ARRAY_SLICE
    : ARRAY_SLICE_TOKEN                                                     {
                                                                            	 $$ = { expression: { type: 'slice', value: $1 } }; yy.ast.node($$);
                                                                            }
    ;

IDENTIFIER
    : IDENTIFIER_NAME                                                       {
                                                                            	 $$ = { expression: { type: 'identifier', value: $1 } }; yy.ast.node($$);
                                                                            }
    ;

ReservedWord
    : TRUE_TOKEN                                                            {
                                                                            	 $$ = { expression: { type: 'keyword', value: true } }; yy.ast.node($$);
                                                                            }
    | FALSE_TOKEN                                                           {
                                                                                $$ = { expression: { type: 'keyword', value: false } }; yy.ast.node($$);
                                                                            }
    | NULL_TOKEN                                                            {
                                                                                $$ = { expression: { type: 'keyword', value: null } }; yy.ast.node($$);
                                                                            }
    | UNDEFINED_TOKEN                                                       {
                                                                                $$ = { expression: { type: 'keyword', value: null } }; yy.ast.node($$);
                                                                            } /** undefined upsets the logic and removes the expression.value */
    ;

/*
 * NON_LISTABLEs demand a subscript of their own
 * SUBSCRIPT_EXPRESSION_NON_LISTABLE
 */


/*
 * NON_REPEATABLEs know how to share, they just insist on being unique in the room
 * SUBSCRIPT_EXPRESSION_NON_REPEATABLE
 */

STRING_LITERAL
    : QQ_STRING                                                             {
                                                                            	 $$ = { expression: { type: 'string_literal', value: yy.ast.unescapeDoubleQuotes($1), meta: '""' } }; yy.ast.set($$);
                                                                            }
    | Q_STRING                                                              {
                                                                            	 $$ = { expression: { type: 'string_literal', value: yy.ast.unescapeSingleQuotes($1), meta: '\'\'' } }; yy.ast.set($$);
                                                                            }
    ;

INTEGER
    : INTEGER_TOKEN                                                         {
                                                                                $$ = { expression: { type: 'numeric_literal', value: parseInt($1) } }; yy.ast.node($$)
                                                                            }
    ;

RegularExpressionLiteral
    : RegularExpressionLiteralBegin REGEXP_LITERAL
                                                                            {
                                                                                $$ = yy.ast.parseRegularExpressionLiteral($1 + $2);
                                                                            }
    ;

RegularExpressionLiteralBegin
    : '/'
                                                                            {
                                                                                yy.lexer.begin('REGEXP');
                                                                            }
    | '/='
                                                                            {
                                                                                yy.lexer.begin('REGEXP');
                                                                            }
    ;


