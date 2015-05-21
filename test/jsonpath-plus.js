var assert = require('chai').assert;
var jgp = new require('../lib/index')();

suite('extended-jsonpath#parse', function() {
  test('parse list of identifier names in indexers :: should parse nested subscript expressions with leading INTEGER,STRING_LITERAL,ARRAY_SLICE', function () {
    var path = jgp.parse("genereLists[0[title,director],'name with spaces'[title,director],1:5[title,director]]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "genereLists"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "union",
                      "value": [
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "title"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "director"
                          }
                        }
                      ]
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "numeric_literal",
                "value": 0
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "union",
                      "value": [
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "title"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "director"
                          }
                        }
                      ]
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "string_literal",
                "value": "name with spaces"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "union",
                      "value": [
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "title"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "director"
                          }
                        }
                      ]
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "slice",
                "value": "1:5"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse list of subscript expressions with STAR :: should parse list of subscript expressions with STAR', function () {
    /***
     * repeated active expressions of type STAR only make sense if {} would designate branch and [] would designate a positional array where the expression is repeatedly applied to items at the specific position
     * It is not the job of the parse to dedup logical repeatables at this stage since we use [] for both branches and subscripts
     * If * is a an item of the subscript list, Handlers process the expression as removeFrom(*,[field1,field2,...]) instead of union(*,field1,field2,...) 
     */
    var path = jgp.parse("genereLists[*,reviews,meta]");
    assert.deepEqual(path, [
      { "expression": { "type": "identifier", "value": "genereLists" }, "operation": "member", "scope": "child" },
      { "expression": { "type": "union", "value": [
        { "expression": { "type": "wildcard", "value": "*" } },
        { "expression": { "type": "identifier", "value": "reviews" } },
        { "expression": { "type": "identifier", "value": "meta" } }
          ] },
        "operation": "subscript", "scope": "child" } ]);
  });

  test('parse slices with SCRIPT_EXPRESSION to declaritive define a slice in terms of array size :: should parse slice with subscripts as SCRIPT_EXPRESSION', function () {
    var path = jgp.parse("genereLists[{@.length-20}:{@.length-20}].name");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "genereLists"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "slice|active",
          "value": [
            "{@.length-20}",
            "{@.length-20}",
            1
          ]
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "type": "identifier",
          "value": "name"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('parse nested single path component after leading expressoin :: ', function () {
    var path = jgp.parse("genereLists[x.name,y.name].name");
    assert.deepEqual(path, [
        {
          "expression": {
            "type": "identifier",
            "value": "genereLists"
          },
          "operation": "member",
          "scope": "child"
        },
        {
          "expression": {
            "type": "union",
            "value": [
              {
                "branch": {
                  "path": [
                    {
                      "expression": {
                        "type": "identifier",
                        "value": "name"
                      },
                      "operation": "member",
                      "scope": "child|branch"
                    }
                  ],
                  "scope": "branch"
                },
                "expression": {
                  "type": "identifier",
                  "value": "x"
                }
              },
              {
                "branch": {
                  "path": [
                    {
                      "expression": {
                        "type": "identifier",
                        "value": "name"
                      },
                      "operation": "member",
                      "scope": "child|branch"
                    }
                  ],
                  "scope": "branch"
                },
                "expression": {
                  "type": "identifier",
                  "value": "y"
                }
              }
            ]
          },
          "operation": "subscript",
          "scope": "child"
        },
        {
          "expression": {
            "type": "identifier",
            "value": "name"
          },
          "operation": "member",
          "scope": "child"
        }
      ]);
  });

  test('parser allows the use of $ inside path is parsed as "$$" root member child expression, which is equivalent to root$ref, references the child\'s root node, wherever the child is', function () {
    var path = jgp.parse("genereLists[$.server,x.name,y.name].name");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "genereLists"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "server"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "root",
                "value": "$$"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "identifier",
                "value": "x"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "identifier",
                "value": "y"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "type": "identifier",
          "value": "name"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('parser allows the use of $ inside path as a member expression after . or .. throws', function () {
    assert.throws(function () { jgp.parse("genereLists[x.$,x.name,y.name].name");});
  });

});
