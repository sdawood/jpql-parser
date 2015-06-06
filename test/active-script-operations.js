var assert = require('assert');
var jpql = new require('../')();
var util = require('util');

suite('jsonpath#active-script-operations', function() {

  test('[1] active script expression operations ({}), default is GET', function() {
    var results = jpql.parse('$..book[({@.length-1}).title]');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "branch": {
          "path": [
            {
              "expression": {
                "type": "identifier",
                "value": "title"
              },
              "operation": "member",
              "scope": "child|branch"
            }
          ],
          "scope": "branch"
        },
        "expression": {
          "active": {
            "map": {
              "script": "{@.length-1}",
              "value": "({@.length-1})"
            },
            "reduce": {},
            "value": "({@.length-1})"
          },
          "type": "script_expression|active",
          "value": "({@.length-1})"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[2] active script expression operations with splat results behavior (*{}), default is GET', function() {
    var results = jpql.parse('$..book[(*{[@.length-1,@.length-2]}).title]');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "branch": {
          "path": [
            {
              "expression": {
                "type": "identifier",
                "value": "title"
              },
              "operation": "member",
              "scope": "child|branch"
            }
          ],
          "scope": "branch"
        },
        "expression": {
          "active": {
            "map": {
              "operation": "*",
              "script": "{[@.length-1,@.length-2]}",
              "value": "(*{[@.length-1,@.length-2]})"
            },
            "reduce": {},
            "value": "(*{[@.length-1,@.length-2]})"
          },
          "type": "script_expression|active",
          "value": "({[@.length-1,@.length-2]})"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[3] active script expression operations with splat results behavior is equivalent to promoting the results into list of scripts (*{}), default is GET', function() {
    var results = jpql.parse('$..book[({@.length-1}),({@.length-2})].title');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
              "expression": {
                "active": {
                  "map": {
                    "script": "{@.length-1}",
                    "value": "({@.length-1})"
                  },
                  "reduce": {},
                  "value": "({@.length-1})"
                },
                "type": "script_expression|active",
                "value": "({@.length-1})"
              }
            },
            {
              "expression": {
                "active": {
                  "map": {
                    "script": "{@.length-2}",
                    "value": "({@.length-2})"
                  },
                  "reduce": {},
                  "value": "({@.length-2})"
                },
                "type": "script_expression|active",
                "value": "({@.length-2})"
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
          "value": "title"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[4] [async] active script expression operations with take(n) splat results behavior (#(n)*{}), default is GET', function() {
    var results = jpql.parse('$..book[(#(2)*{[@.length-1,@.length-2]}).title]');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "branch": {
          "path": [
            {
              "expression": {
                "type": "identifier",
                "value": "title"
              },
              "operation": "member",
              "scope": "child|branch"
            }
          ],
          "scope": "branch"
        },
        "expression": {
          "active": {
            "map": {
              "async": "#",
              "operation": "*",
              "script": "{[@.length-1,@.length-2]}",
              "take": "2",
              "value": "(#(2)*{[@.length-1,@.length-2]})"
            },
            "reduce": {},
            "value": "(#(2)*{[@.length-1,@.length-2]})"
          },
          "type": "script_expression|active",
          "value": "({[@.length-1,@.length-2]})"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });


  test('[5] active script expression operations with argument ({}):({}), default "~" (POST or PUT)', function() {
    var results = jpql.parse('$..book[?(@.title===null)].({title}):({"Not Available"})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.title===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "script": "{title}",
              "value": "({title})"
            },
            "reduce": {
              "script": "{\"Not Available\"}",
              "value": "({\"Not Available\"})"
            },
            "value": "({title}):({\"Not Available\"})"
          },
          "type": "script_expression|active",
          "value": "({title})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[6] active script expression operations with argument ({}):({[]}) and array value, default "~" (POST or PUT), implementation should concat or push value to existing array if any', function() {
    var results = jpql.parse('$..book[?(@.title===null)].({tags}):({["Not Available"]})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.title===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "script": "{tags}",
              "value": "({tags})"
            },
            "reduce": {
              "script": "{[\"Not Available\"]}",
              "value": "({[\"Not Available\"]})"
            },
            "value": "({tags}):({[\"Not Available\"]})"
          },
          "type": "script_expression|active",
          "value": "({tags})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[7] active script expression operations with argument (+{}):({}), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal', function() {
    var results = jpql.parse('$..book[?(@.title===null)].(+{tags}):({["Not Available"]})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.title===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "+",
              "script": "{tags}",
              "value": "(+{tags})"
            },
            "reduce": {
              "script": "{[\"Not Available\"]}",
              "value": "({[\"Not Available\"]})"
            },
            "value": "(+{tags}):({[\"Not Available\"]})"
          },
          "type": "script_expression|active",
          "value": "({tags})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

 test('[8] [computed active script argument] active script expression operations with computed active script argument  (+{}):(={ @ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)].(+{fullName}):(={' +
      '@.firstName + " " + @.lastName' +
      '})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.fulleName===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "+",
              "script": "{fullName}",
              "value": "(+{fullName})"
            },
            "reduce": {
              "operation": "=",
              "script": "{@.firstName + \" \" + @.lastName}",
              "value": "(={@.firstName + \" \" + @.lastName})"
            },
            "value": "(+{fullName}):(={@.firstName + \" \" + @.lastName})"
          },
          "type": "script_expression|active",
          "value": "({fullName})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

 test('[9] [async computed nested $ path result] active script expression operations with computed nested path argument with reference to true root (+{}:=#{ $ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)].(+{fullName}):(#={' +
      '$..book[?(@.fulleName===null)][firstName, lastName]' +
      '})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.fulleName===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "+",
              "script": "{fullName}",
              "value": "(+{fullName})"
            },
            "reduce": {
              "async": "#",
              "operation": "=",
              "script": "{$..book[?(@.fulleName===null)][firstName, lastName]}",
              "value": "(#={$..book[?(@.fulleName===null)][firstName, lastName]})"
            },
            "value": "(+{fullName}):(#={$..book[?(@.fulleName===null)][firstName, lastName]})"
          },
          "type": "script_expression|active",
          "value": "({fullName})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

 test('[10] [async subscribe to nested @$ path result] active script expression operations with computed nested path argument with reference to script context "@$" (+{}):(=#{ @$ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)].(+{fullName}):(#(1)={@$[firstName, lastName]})'); // take(1) is the default, can be written as #
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.fulleName===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "+",
              "script": "{fullName}",
              "value": "(+{fullName})"
            },
            "reduce": {
              "async": "#",
              "operation": "=",
              "script": "{@$[firstName, lastName]}",
              "take": "1",
              "value": "(#(1)={@$[firstName, lastName]})"
            },
            "value": "(+{fullName}):(#(1)={@$[firstName, lastName]})"
          },
          "type": "script_expression|active",
          "value": "({fullName})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

 test('[11] parse nested path with context root reference "@$" and root reference "$", used by active script handler implementation for path lazy evaluation', function() {
    var results = jpql.parse('@$.profile[$.language["default"]]');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root|active",
          "value": "@$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "profile"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "branch": {
          "path": [
            {
              "expression": {
                "type": "identifier",
                "value": "language"
              },
              "operation": "member",
              "scope": "child|branch"
            },
            {
              "expression": {
                "type": "string_literal",
                "value": "default"
              },
              "operation": "subscript",
              "scope": "child|branch"
            }
          ],
          "scope": "branch"
        },
        "expression": {
          "type": "root",
          "value": "$"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

 test('[12] [async subscribe to nested path component == active script result] active script expression operations with computed nested active script expression with reference to parent script context value (+{}):(=#{ ({@@}) }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)].(#tag+{fullName}):(#={' +
      '@@.firstName + " " + @@.lastName' +
      '})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.fulleName===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "async": "#",
              "operation": "+",
              "script": "{fullName}",
              "tag": "tag",
              "value": "(#tag+{fullName})"
            },
            "reduce": {
              "async": "#",
              "operation": "=",
              "script": "{@@.firstName + \" \" + @@.lastName}",
              "value": "(#={@@.firstName + \" \" + @@.lastName})"
            },
            "value": "(#tag+{fullName}):(#={@@.firstName + \" \" + @@.lastName})"
          },
          "type": "script_expression|active",
          "value": "({fullName})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

 test('[13] [async subscribe to component via active script optation take (10) (#(n){@})', function() {
    var results = jpql.parse('$..book[?(@.discount)].(#(10){title})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.discount)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "async": "#",
              "script": "{title}",
              "take": "10",
              "value": "(#(10){title})"
            },
            "reduce": {},
            "value": "(#(10){title})"
          },
          "type": "script_expression|active",
          "value": "({title})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[14] active script expression operations with argument ({}), set "=" (PUT), set overwrites existing key/value, implementation should warn or err if not found', function() {
    var results = jpql.parse('$..book[?(@.title===null)].(={tags}):({"Not Available"})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.title===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "=",
              "script": "{tags}",
              "value": "(={tags})"
            },
            "reduce": {
              "script": "{\"Not Available\"}",
              "value": "({\"Not Available\"})"
            },
            "value": "(={tags}):({\"Not Available\"})"
          },
          "type": "script_expression|active",
          "value": "({tags})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[15] active script expression operation without argument ({}), remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.parse('$..book.(-{fullName})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "-",
              "script": "{fullName}",
              "value": "(-{fullName})"
            },
            "reduce": {},
            "value": "(-{fullName})"
          },
          "type": "script_expression|active",
          "value": "({fullName})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[6] filter expression followed by delete expression operation without argument ({}), key remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)][(-{fullName})]');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.fulleName===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "-",
              "script": "{fullName}",
              "value": "(-{fullName})"
            },
            "reduce": {},
            "value": "(-{fullName})"
          },
          "type": "script_expression|active",
          "value": "({fullName})"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[17] filter expression followed by delete expression operation without key (-{}), sink hole "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)][(-{})]');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.fulleName===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "-",
              "script": "{}",
              "value": "(-{})"
            },
            "reduce": {},
            "value": "(-{})"
          },
          "type": "script_expression|active",
          "value": "({})"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[18] deleting filter expression, shorthand for filter expression followed by delete expression operation without key or (-{}), partial remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.parse('$..book[?-(@.fulleName===null)]');
    assert.deepEqual(results, [false]);
  });

 test('[19] [Structure Matching] lookahead filter expression, shorthand for filter expression with ANDed or ORed @.key expressions', function() {
    var results = jpql.parse('$..book[?=(@)].discount'); //equivalent to $..book[?(@.discount)]' but effectively uses the next component as a structural template to mach the current object against
    assert.deepEqual(results, [false]);
  });

 test('[20] [Structure Matching]negative lookahead filter expression, shorthand for filter expression followed by delete expression operation without key or (-{}), partial remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.parse('$..book[?!(@)][invalid, deprecated, obsolete]'); //equivalent to $..book[?(!@.invalid && !@.deprecated && !@.onbsolete )]
    assert.deepEqual(results, [false]);
  });

  test('[21] parse mapping script, implementation should not set script return result into partial and return the script result as is and (without using the result to access the partial in default behavior)', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)].(=>{"Not Available!"})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "filter_expression",
          "value": "?(@.fulleName===null)"
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "=>",
              "script": "{\"Not Available!\"}",
              "value": "(=>{\"Not Available!\"})"
            },
            "reduce": {},
            "value": "(=>{\"Not Available!\"})"
          },
          "type": "script_expression|active",
          "value": "({\"Not Available!\"})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[22] parse mapping script, mergeAll (value or default if value is null or key does not exist) scenario, implementation chose to bind the script this reference to the partial instead of using "@', function() {
    var results = jpql.parse('$..book[fullName, ?(this.fulleName===null).(=>{"Not Available"})]');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
              "expression": {
                "type": "identifier",
                "value": "fullName"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "active": {
                        "map": {
                          "operation": "=>",
                          "script": "{\"Not Available\"}",
                          "value": "(=>{\"Not Available\"})"
                        },
                        "reduce": {},
                        "value": "(=>{\"Not Available\"})"
                      },
                      "type": "script_expression|active",
                      "value": "({\"Not Available\"})"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "filter_expression",
                "value": "?(this.fulleName===null)"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

 test('[23] parse mapping script, for this key return that value, key has to exist in the data source, Mocking and Defaults', function() {
    var results = jpql.parse('$..book.reviews.(#{details}):(#retry(10)=>{"Temporary Not Available"})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "identifier",
          "value": "reviews"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "async": "#",
              "script": "{details}",
              "value": "(#{details})"
            },
            "reduce": {
              "async": "#",
              "operation": "=>",
              "script": "{\"Temporary Not Available\"}",
              "tag": "retry",
              "take": "10",
              "value": "(#retry(10)=>{\"Temporary Not Available\"})"
            },
            "value": "(#{details}):(#retry(10)=>{\"Temporary Not Available\"})"
          },
          "type": "script_expression|active",
          "value": "({details})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

 test('[24] parse mapping script, mergeAll value or default scenario, implementation chose to bind the script this reference to the partial instead of using "@', function() {
    var results = jpql.parse('$..book[fullName, (=>{@.fullName ? undefined : "Not Available"})]');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
              "expression": {
                "type": "identifier",
                "value": "fullName"
              }
            },
            {
              "expression": {
                "active": {
                  "map": {
                    "operation": "=>",
                    "script": "{@.fullName ? undefined : \"Not Available\"}",
                    "value": "(=>{@.fullName ? undefined : \"Not Available\"})"
                  },
                  "reduce": {},
                  "value": "(=>{@.fullName ? undefined : \"Not Available\"})"
                },
                "type": "script_expression|active",
                "value": "({@.fullName ? undefined : \"Not Available\"})"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[25] parse active script operation call receiving literal arguments', function() {
    var results = jpql.parse('$.store.book.(=>{push}):({ {"4": {title: "New Book"} } })');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "store"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "identifier",
          "value": "book"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "=>",
              "script": "{push}",
              "value": "(=>{push})"
            },
            "reduce": {
              "script": "{ {\"4\": {title: \"New Book\"} } }",
              "value": "({ {\"4\": {title: \"New Book\"} } })"
            },
            "value": "(=>{push}):({ {\"4\": {title: \"New Book\"} } })"
          },
          "type": "script_expression|active",
          "value": "({push})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[26] parse active script operation call receiving computed argument', function() {
    var results = jpql.parse('$.store.(=>{decrement}):(#tagExpired{$..book.onOffer[@.length-1]})');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "store"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "operation": "=>",
              "script": "{decrement}",
              "value": "(=>{decrement})"
            },
            "reduce": {
              "async": "#",
              "script": "{$..book.onOffer[@.length-1]}",
              "tag": "tagExpired",
              "value": "(#tagExpired{$..book.onOffer[@.length-1]})"
            },
            "value": "(=>{decrement}):(#tagExpired{$..book.onOffer[@.length-1]})"
          },
          "type": "script_expression|active",
          "value": "({decrement})"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

})

suite('jsonpath#subscribe and take', function() {
  test('[1] async: subscribe to filtered path component updates', function() {
    var results = jpql.parse('$..book.?#tagPending(@.title===null)]');
    assert.deepEqual(results, [false]);
  });

  test('[2] async: subscribe to filtered path component updates, take 10', function() {
    var results = jpql.parse('$..book.?#(10)(@$.title===null)]');
    assert.deepEqual(results, [false]);
  });

  test('[3] async: subscribe to path component updates, take top 10 action titles via active script operation "@(10)"', function() {
    var results = jpql.parse('$..category.sorted.(#take(10){action}).title');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "category"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "identifier",
          "value": "sorted"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "async": "#",
              "script": "{action}",
              "tag": "take",
              "take": "10",
              "value": "(#take(10){action})"
            },
            "reduce": {},
            "value": "(#take(10){action})"
          },
          "type": "script_expression|active",
          "value": "({action})"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "identifier",
          "value": "title"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[4] async: subscribe to path component updates, take top 10 splat action titles via active script operation "@(10)"', function() {
    var results = jpql.parse('$..category.sorted.(#(10)*{action, comedy}).title');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "category"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "identifier",
          "value": "sorted"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "async": "#",
              "operation": "*",
              "script": "{action, comedy}",
              "take": "10",
              "value": "(#(10)*{action, comedy})"
            },
            "reduce": {},
            "value": "(#(10)*{action, comedy})"
          },
          "type": "script_expression|active",
          "value": "({action, comedy})"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "identifier",
          "value": "title"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[5] async: subscribe to path component updates, take top 10 from preceding partial', function() {
    var results = jpql.parse('$..category.sorted.(#(10))');
    assert.deepEqual(results, [
      {
        "expression": {
          "type": "root",
          "value": "$"
        }
      },
      {
        "expression": {
          "type": "identifier",
          "value": "category"
        },
        "operation": "member",
        "scope": "descendant"
      },
      {
        "expression": {
          "type": "identifier",
          "value": "sorted"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "active": {
            "map": {
              "async": "#",
              "take": "10",
              "value": "(#(10))"
            },
            "reduce": {},
            "value": "(#(10))"
          },
          "type": "script_expression|active",
          "value": "(undefined)"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('[6] async: async and take path components', function() {
    var results = jpql.parse('$..#.category.#tag.sorted.(10)');
    assert.deepEqual(results, [false]);
  });

  test('[6] async: async take and asyncTake path components', function() {
    var results = jpql.parse('$..#.category.#tagSorted(10).sorted');
    assert.deepEqual(results, [false]);
  });

  test('[7] delete operation path component', function() {
    var results = jpql.parse('$..category.-.sorted'); // equivalent to '$..category.sorted.(-{})'
    assert.deepEqual(results, [false]);
  });

  test('[7] Combo delete operation path component and add active script epxression', function() {
    var results = jpql.parse('$..category[-.sorted,(+{reverseSorted}):(=>{@.reverse()})]');
    assert.deepEqual(results, [false]);
  });

})
