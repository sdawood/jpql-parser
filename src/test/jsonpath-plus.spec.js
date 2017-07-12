const Parser = require('../index');
const jpql = new Parser();

describe('extended-jsonpath#parse', () => {
    it('parse list of identifier names in indexers :: should parse nested subscript expressions with leading INTEGER,STRING_LITERAL,ARRAY_SLICE', () => {
        const path = jpql.parse("genereLists[0[title,director],'name with spaces'[title,director],1:5[title,director]]");
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'union',
                                            value: [
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'title'
                                                    }
                                                },
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'director'
                                                    }
                                                }
                                            ]
                                        },
                                        operation: 'subscript',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'numeric_literal',
                                value: 0
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'union',
                                            value: [
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'title'
                                                    }
                                                },
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'director'
                                                    }
                                                }
                                            ]
                                        },
                                        operation: 'subscript',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'string_literal',
                                value: 'name with spaces'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'union',
                                            value: [
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'title'
                                                    }
                                                },
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'director'
                                                    }
                                                }
                                            ]
                                        },
                                        operation: 'subscript',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'slice',
                                value: '1:5'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse list of subscript expressions with STAR :: should parse list of subscript expressions with STAR', () => {
        /***
         * repeated active expressions of type STAR only make sense if {} would designate branch and [] would designate a positional array where the expression is repeatedly applied to items at the specific position
         * It is not the job of the parse to dedup logical repeatables at this stage since we use [] for both branches and subscripts
         * If * is a an item of the subscript list, Handlers process the expression as removeFrom(*,[field1,field2,...]) instead of union(*,field1,field2,...)
         */
        const path = jpql.parse('genereLists[*,reviews,meta]');
        expect(path).toEqual([
            {expression: {type: 'identifier', value: 'genereLists'}, operation: 'member', scope: 'child'},
            {
                expression: {
                    type: 'union', value: [
                        {expression: {type: 'wildcard', value: '*'}},
                        {expression: {type: 'identifier', value: 'reviews'}},
                        {expression: {type: 'identifier', value: 'meta'}}
                    ]
                },
                operation: 'subscript', scope: 'child'
            }]);
    });

    it('parse slices with SCRIPT_EXPRESSION to declaritive define a slice in terms of array size :: should parse slice with subscripts as SCRIPT_EXPRESSION', () => {
        const path = jpql.parse('genereLists[({@.length-20}):({@.length-20})].name');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            script: '{@.length-20}',
                            value: '({@.length-20})'
                        },
                        reduce: {
                            script: '{@.length-20}',
                            value: '({@.length-20})'
                        },
                        value: '({@.length-20}):({@.length-20})'
                    },
                    type: 'script_expression|active',
                    value: '({@.length-20})'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'name'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('parse nested single path component after leading expression', () => {
        const path = jpql.parse('genereLists[x.name,y.name].name');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'identifier',
                                value: 'x'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'identifier',
                                value: 'y'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'name'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('parser allows the use of $ inside path is parsed as $ root member child expression, which is equivalent to root$ref, references the child\'s root node, wherever the child is', () => {
        const path = jpql.parse('genereLists[$.server,x.name,y.name].name');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'server'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'root',
                                value: '$'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'identifier',
                                value: 'x'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'identifier',
                                value: 'y'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'name'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('parser allows the use of $ inside path as a member expression after . or .. throws', () => {
        expect(() => jpql.parse('genereLists[x.$,x.name,y.name].name')).toThrow();
    });

    it('parse nested subscript expression with leading simple expression (integer)', () => {
        const path = jpql.parse('genereLists[0[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'numeric_literal',
                    value: 0
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading simple expression (string-literal)', () => {
        const path = jpql.parse("genereLists['genre name with spaces'[name,rating]]");
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'string_literal',
                    value: 'genre name with spaces'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading simple expression (identifier)', () => {
        const path = jpql.parse('genereLists[action[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'identifier',
                    value: 'action'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading simple expression (keyword)', () => {
        const path = jpql.parse('genereLists[true[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'keyword',
                    value: true
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (array-slice)', () => {
        const path = jpql.parse('genereLists[0:5[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'slice',
                    value: '0:5'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (active-array-slice)', () => {
        const path = jpql.parse('genereLists[(#slice {@.length-5}):({@.length-1})[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    active: {
                        map: {
                            label: 'slice',
                            script: '{@.length-5}',
                            tag: '#',
                            value: '(#slice {@.length-5})'
                        },
                        reduce: {
                            script: '{@.length-1}',
                            value: '({@.length-1})'
                        },
                        value: '(#slice {@.length-5}):({@.length-1})'
                    },
                    type: 'script_expression|active',
                    value: '({@.length-5})'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (script-expression)', () => {
        const path = jpql.parse('genereLists[(@.length)[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'script_expression',
                    value: '(@.length)'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (active-script-expression)', () => {
        const path = jpql.parse('genereLists[({$.byRating[-1]})[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    active: {
                        map: {
                            script: '{$.byRating[-1]}',
                            value: '({$.byRating[-1]})'
                        },
                        reduce: {},
                        value: '({$.byRating[-1]})'
                    },
                    type: 'script_expression|active',
                    value: '({$.byRating[-1]})'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (star)', () => {
        const path = jpql.parse('genereLists[*[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'wildcard',
                    value: '*'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (filter-expression)', () => {
        const path = jpql.parse('genereLists[?(@.rating>4)[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'filter_expression',
                    value: '?(@.rating>4)'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with a list of (filter-expression)', () => {
        const path = jpql.parse('genereLists[?(@.rating>4)[name,rating],?(@.rating===5),?(@.rating==0)]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'union',
                                            value: [
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'name'
                                                    }
                                                },
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'rating'
                                                    }
                                                }
                                            ]
                                        },
                                        operation: 'subscript',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'filter_expression',
                                value: '?(@.rating>4)'
                            }
                        },
                        {
                            expression: {
                                type: 'filter_expression',
                                value: '?(@.rating===5)'
                            }
                        },
                        {
                            expression: {
                                type: 'filter_expression',
                                value: '?(@.rating==0)'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression ($)', () => {
        const path = jpql.parse('genereLists[*][$[name,rating]]'); //$ references child root node, this specific simple case is equivalent to genereLists[*][name,rating]
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'wildcard',
                    value: '*'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'root',
                    value: '$'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression with leading member component expression', () => {
        const path = jpql.parse('genereLists[*][.action[name,rating],.comedy[name,rating]]'); // .action here is equivalent to identifier action
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'wildcard',
                    value: '*'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'action'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    },
                                    {
                                        expression: {
                                            type: 'union',
                                            value: [
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'name'
                                                    }
                                                },
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'rating'
                                                    }
                                                }
                                            ]
                                        },
                                        operation: 'subscript',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'active_position',
                                value: '{{$index}}'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'comedy'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    },
                                    {
                                        expression: {
                                            type: 'union',
                                            value: [
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'name'
                                                    }
                                                },
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'rating'
                                                    }
                                                }
                                            ]
                                        },
                                        operation: 'subscript',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'active_position',
                                value: '{{$index}}'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[X] parse nested subscript expression with leading descendant component expression, subscript reduced into subscript-union', () => {
        const path = jpql.parse('genereLists[..action[name,rating],..comedy[name,rating]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'union',
                                            value: [
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'name'
                                                    }
                                                },
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'rating'
                                                    }
                                                }
                                            ]
                                        },
                                        operation: 'subscript',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'identifier',
                                value: 'action'
                            },
                            operation: 'member',
                            scope: 'descendant'
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'union',
                                            value: [
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'name'
                                                    }
                                                },
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'rating'
                                                    }
                                                }
                                            ]
                                        },
                                        operation: 'subscript',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'identifier',
                                value: 'comedy'
                            },
                            operation: 'member',
                            scope: 'descendant'
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[X] parse single subscript expression with leading descendant component expression, descendant reduced into subscript descendant', () => {
        const path = jpql.parse('$..book[0][..profile]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'numeric_literal',
                    value: 0
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'profile'
                },
                operation: 'subscript',
                scope: 'descendant'
            }
        ]);
    });

    it(`[X] parse single subscript expression with leading subscript descendant list with a member component. '$..book[0][..profile]' === '$..book[0]..[profile]'`, () => {
        const path = jpql.parse('$..book[0]..[profile]');
        expect(path).toEqual(jpql.parse('$..book[0][..profile]'));
    });

    it(`[X] simplification-1: parse single subscript expression with '$..book[0][..profile]' === '$..book[0]..[profile]'`, () => {
        const path = jpql.parse('$..book[0]..[profile]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'numeric_literal',
                    value: 0
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'profile'
                },
                operation: 'subscript',
                scope: 'descendant'
            }
        ]);
    });

    it(`[X] simplification-2 parse single subscript expression with '$..book[0]..[profile]' == '$..book[0]..profile'`, () => {
        const path = jpql.parse('$..book[0]..[profile]');
        expect(path).not.toEqual(jpql.parse('$..book[0]..profile'));
    });

    it('[X] parse single subscript expression with leading subscript descendant list without branch.', () => {
        const path = jpql.parse('$..book[..[name]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'name'
                            },
                            operation: 'subscript',
                            scope: 'descendant|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'active_position',
                    value: '{{$index}}'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse path with leading descendant member expression, retain scope of leading member', () => {
        const path = jpql.parse('..store.book');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'store'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('parse nested subscript expression without leading expression (active-index)', () => {
        const path = jpql.parse('genereLists[.rating,[name,rating],.name]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'genereLists'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'rating'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'active_position',
                                value: '{{$index}}'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'union',
                                            value: [
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'name'
                                                    }
                                                },
                                                {
                                                    expression: {
                                                        type: 'identifier',
                                                        value: 'rating'
                                                    }
                                                }
                                            ]
                                        },
                                        operation: 'subscript',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'active_position',
                                value: '{{$index}}'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'active_position',
                                value: '{{$index}}'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });


    it('parse list of (longer) nested path components list', () => {
        const path = jpql.parse('$.store.book[*][0.author..name,1.author..name,2.author..name,3.author..name]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'store'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'wildcard',
                    value: '*'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'author'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'descendant|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'numeric_literal',
                                value: 0
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'author'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'descendant|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'numeric_literal',
                                value: 1
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'author'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'descendant|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'numeric_literal',
                                value: 2
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'author'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'descendant|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'numeric_literal',
                                value: 3
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse list of single nested subscript component with leading nested path component', () => {
        const path = jpql.parse('$.store.book[0.author[main,co][..name[first,last],..twitter]]');
        expect(path).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'store'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'author'
                            },
                            operation: 'member',
                            scope: 'child|branch'
                        },
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'main'
                                        }
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'co'
                                        }
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        },
                        {
                            expression: {
                                type: 'union',
                                value: [
                                    {
                                        branch: {
                                            path: [
                                                {
                                                    expression: {
                                                        type: 'union',
                                                        value: [
                                                            {
                                                                expression: {
                                                                    type: 'identifier',
                                                                    value: 'first'
                                                                }
                                                            },
                                                            {
                                                                expression: {
                                                                    type: 'identifier',
                                                                    value: 'last'
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    operation: 'subscript',
                                                    scope: 'child|branch'
                                                }
                                            ],
                                            scope: 'branch'
                                        },
                                        expression: {
                                            type: 'identifier',
                                            value: 'name'
                                        },
                                        operation: 'member',
                                        scope: 'descendant'
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'twitter'
                                        },
                                        scope: 'descendant'
                                    }
                                ]
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'numeric_literal',
                    value: 0
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[X] all books [author,title] via list of subscript expression with first level STAR expression', () => {
        const results = jpql.parse('$..book[*.title,*.price]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'wildcard',
                                value: '*'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'price'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'wildcard',
                                value: '*'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[X] all books [author,title] via list of subscript expression with first level filter expression', () => {
        const results = jpql.parse('$..book[?(@.isbn).title,?(@.isbn).price]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'filter_expression',
                                value: '?(@.isbn)'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'price'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'filter_expression',
                                value: '?(@.isbn)'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[X] all books [author,title] via list of subscript expression with first level slice expression', () => {
        const results = jpql.parse('$..book[1:2.title,3:4.price]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'slice',
                                value: '1:2'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'price'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'slice',
                                value: '3:4'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[X] all books [author,title] via list of subscript expression with first level active slice expression', () => {
        const results = jpql.parse('$..book[(#slice {@.length-3}):({@.length-2}).title,(#slice {@.length-2}):({@.length-1}).title.price]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        label: 'slice',
                                        script: '{@.length-3}',
                                        tag: '#',
                                        value: '(#slice {@.length-3})'
                                    },
                                    reduce: {
                                        script: '{@.length-2}',
                                        value: '({@.length-2})'
                                    },
                                    value: '(#slice {@.length-3}):({@.length-2})'
                                },
                                type: 'script_expression|active',
                                value: '({@.length-3})'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'price'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        label: 'slice',
                                        script: '{@.length-2}',
                                        tag: '#',
                                        value: '(#slice {@.length-2})'
                                    },
                                    reduce: {
                                        script: '{@.length-1}',
                                        value: '({@.length-1})'
                                    },
                                    value: '(#slice {@.length-2}):({@.length-1})'
                                },
                                type: 'script_expression|active',
                                value: '({@.length-2})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[X] all books [author,title] via list of subscript expression with first level script expression', () => {
        const results = jpql.parse('$..book[(@.length-2).title,(@.length-1).price]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'script_expression',
                                value: '(@.length-2)'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'price'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'script_expression',
                                value: '(@.length-1)'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[X] all books [author,title] via list of subscript expression with first level active script expression', () => {
        const results = jpql.parse('$..book[({@.length-2}).title,({@.length-1}).price]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        script: '{@.length-2}',
                                        value: '({@.length-2})'
                                    },
                                    reduce: {},
                                    value: '({@.length-2})'
                                },
                                type: 'script_expression|active',
                                value: '({@.length-2})'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'price'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        script: '{@.length-1}',
                                        value: '({@.length-1})'
                                    },
                                    reduce: {},
                                    value: '({@.length-1})'
                                },
                                type: 'script_expression|active',
                                value: '({@.length-1})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[X] all books [author,title] via list of subscript expression with first level $root back reference expression', () => {
        const results = jpql.parse('$..book[$.0.title,$.1.price]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'numeric_literal',
                                            value: 0
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'root',
                                value: '$'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'numeric_literal',
                                            value: 1
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    },
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'price'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'root',
                                value: '$'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[Y] all books [author,title] via list of subscript expression with first level call expression -> active position anchor', () => {
        const results = jpql.parse('$..book[(@(100)-{}).title,(@(5000)-{}).download]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        async: '@',
                                        operation: '-',
                                        script: '{}',
                                        take: '100',
                                        value: '(@(100)-{})'
                                    },
                                    reduce: {},
                                    value: '(@(100)-{})'
                                },
                                type: 'script_expression|active',
                                value: '({})'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'download'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        async: '@',
                                        operation: '-',
                                        script: '{}',
                                        take: '5000',
                                        value: '(@(5000)-{})'
                                    },
                                    reduce: {},
                                    value: '(@(5000)-{})'
                                },
                                type: 'script_expression|active',
                                value: '({})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[Y] all books [author,title] via list of subscript expression with first level call expression -> active position anchor', () => {
        const results = jpql.parse('$..book[(@(100)-{}).title,(@(100)-{}).price]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        async: '@',
                                        operation: '-',
                                        script: '{}',
                                        take: '100',
                                        value: '(@(100)-{})'
                                    },
                                    reduce: {},
                                    value: '(@(100)-{})'
                                },
                                type: 'script_expression|active',
                                value: '({})'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'price'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        async: '@',
                                        operation: '-',
                                        script: '{}',
                                        take: '100',
                                        value: '(@(100)-{})'
                                    },
                                    reduce: {},
                                    value: '(@(100)-{})'
                                },
                                type: 'script_expression|active',
                                value: '({})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it(`[?] in call expression, spaces are illegal between the opening ( and the key, and between the key and the ':', parse as script expression`, () => {
        const results = jpql.parse('$..book[(@(100)-{}).title,(@(100)-{}).price]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'title'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        async: '@',
                                        operation: '-',
                                        script: '{}',
                                        take: '100',
                                        value: '(@(100)-{})'
                                    },
                                    reduce: {},
                                    value: '(@(100)-{})'
                                },
                                type: 'script_expression|active',
                                value: '({})'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'price'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        async: '@',
                                        operation: '-',
                                        script: '{}',
                                        take: '100',
                                        value: '(@(100)-{})'
                                    },
                                    reduce: {},
                                    value: '(@(100)-{})'
                                },
                                type: 'script_expression|active',
                                value: '({})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[Y] subscript-style call expression with identifier style key', () => {
        const results = jpql.parse('$..book.(@(2)).title'); //subscript style call
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            take: '2',
                            value: '(@(2))'
                        },
                        reduce: {},
                        value: '(@(2))'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'title'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[negative] subscript-style call expression with double quote string style key throws', () => {
        expect(() => jpql.parse('$..book(take: 2).title')).toThrow(); //subscript style call
    });

    it('[negative] subscript-style call expression with single quote string style key throws', () => {
        expect(() => jpql.parse("$..book('take': 2).title")).toThrow(); //subscript style call
    });

    it('[negative] subscript-style call expression with integer literal style key throws', () => {
        expect(() => jpql.parse('$..book(0: 2).title')).toThrow(); //subscript style call
    });

    it('[?] subscript-style call expression with keyword literal style key coerces into string', () => {
        const results = jpql.parse('$..book.(#true{2}).title'); //subscript style call
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        map: {
                            label: 'true',
                            script: '{2}',
                            tag: '#',
                            value: '(#true{2})'
                        },
                        reduce: {},
                        value: '(#true{2})'
                    },
                    type: 'script_expression|active',
                    value: '({2})'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'title'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[Y] just a member followed by a script expression, while implementation can produce the same result, the parser does not consider this a call expression, not to be confused with book(take: 2)', () => {
        const results = jpql.parse('$..book.take.(2).title'); //subscript style call
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'take'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'script_expression',
                    value: '(2)'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'title'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[negative] script expression is cannot switch places with a call expression', () => {
        expect(() => jpql.parse('$..book.take(2).title')).toThrow(); //subscript style call
    });

    it('[X] descendant call expression', () => {
        const results = jpql.parse('$.store.*..(@(1)).name'); //first of each category
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'store'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'wildcard',
                    value: '*'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            take: '1',
                            value: '(@(1))'
                        },
                        reduce: {},
                        value: '(@(1))'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'name'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[X] active script expressions listables are still members :: SCRIPT', () => {
        const results = jpql.parse('$..book.(@.length-1).title');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'script_expression',
                    value: '(@.length-1)'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'title'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[X] active script expressions listables are still members :: STAR', () => {
        const results = jpql.parse('$..book.*.title');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'wildcard',
                    value: '*'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'title'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('active script expressions listables are still members :: ACTIVE_SCRIPT', () => {
        const results = jpql.parse('$..book.({@.length-1}).title');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        map: {
                            script: '{@.length-1}',
                            value: '({@.length-1})'
                        },
                        reduce: {},
                        value: '({@.length-1})'
                    },
                    type: 'script_expression|active',
                    value: '({@.length-1})'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'title'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });
});

