var assert = require('chai').assert;
var jpql = new require('../lib/index')();

suite('extended-jsonpath#parse', function() {
  test('parse list of identifier names in indexers :: should parse nested subscript expressions with leading INTEGER,STRING_LITERAL,ARRAY_SLICE', function () {
    var path = jpql.parse("genereLists[0[title,director],'name with spaces'[title,director],1:5[title,director]]");
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
    var path = jpql.parse("genereLists[*,reviews,meta]");
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
    var path = jpql.parse("genereLists[({@.length-20}):({@.length-20})].name");
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
            "({@.length-20})",
            "({@.length-20})",
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
    var path = jpql.parse("genereLists[x.name,y.name].name");
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
    var path = jpql.parse("genereLists[$.server,x.name,y.name].name");
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
    assert.throws(function () { jpql.parse("genereLists[x.$,x.name,y.name].name");});
  });

  test('parse nested subscript expression with leading simple expression (integer)', function () {
    var path = jpql.parse("genereLists[0[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading simple expression (string-literal)', function () {
    var path = jpql.parse("genereLists['genre name with spaces'[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "value": "genre name with spaces"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading simple expression (identifier)', function () {
    var path = jpql.parse("genereLists[action[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "type": "identifier",
          "value": "action"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading simple expression (keyword)', function () {
    var path = jpql.parse("genereLists[true[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "type": "keyword",
          "value": true
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (array-slice)', function () {
    var path = jpql.parse("genereLists[0:5[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "value": "0:5"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (active-array-slice)', function () {
    var path = jpql.parse("genereLists[({@.length-5}):({@.length-1})[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "type": "slice|active",
          "value": [
            "({@.length-5})",
            "({@.length-1})",
            1
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (script-expression)', function () {
    var path = jpql.parse("genereLists[(@.length)[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "type": "script_expression",
          "value": "(@.length)"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (active-script-expression)', function () {
    var path = jpql.parse("genereLists[({$.byRating[-1]})[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "type": "script_expression|active",
          "value": "({$.byRating[-1]})"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (star)', function () {
    var path = jpql.parse("genereLists[*[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "type": "wildcard",
          "value": "*"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (filter-expression)', function () {
    var path = jpql.parse("genereLists[?(@.rating>4)[name,rating]]");
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "type": "filter_expression",
          "value": "?(@.rating>4)"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with a list of (filter-expression)', function () {
    var path = jpql.parse("genereLists[?(@.rating>4)[name,rating],?(@.rating===5),?(@.rating==0)]");
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
                            "value": "name"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "rating"
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
                "type": "filter_expression",
                "value": "?(@.rating>4)"
              }
            },
            {
              "expression": {
                "type": "filter_expression",
                "value": "?(@.rating===5)"
              }
            },
            {
              "expression": {
                "type": "filter_expression",
                "value": "?(@.rating==0)"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression ($)', function () {
    var path = jpql.parse("genereLists[*][$[name,rating]]"); //$$ references child root node, this specific simple case is equivalent to genereLists[*][name,rating]
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
          "type": "wildcard",
          "value": "*"
        },
        "operation": "subscript",
        "scope": "child"
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
                      "value": "name"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "rating"
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
          "type": "root",
          "value": "$$"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading member component expression', function () {
    var path = jpql.parse("genereLists[*][.action[name,rating],.comedy[name,rating]]"); // .action here is equivalent to identifier action
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
          "type": "wildcard",
          "value": "*"
        },
        "operation": "subscript",
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
                      "value": "action"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "union",
                      "value": [
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "name"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "rating"
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
                "type": "active_position",
                "value": "{{$index}}"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "comedy"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "union",
                      "value": [
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "name"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "rating"
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
                "type": "active_position",
                "value": "{{$index}}"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression with leading descendant component expression', function () {
    var path = jpql.parse("genereLists[..action[name,rating],..comedy[name,rating]]");
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
                            "value": "name"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "rating"
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
                "type": "identifier",
                "value": "action"
              },
              "operation": "member",
              "scope": "descendant"
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
                            "value": "name"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "rating"
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
                "type": "identifier",
                "value": "comedy"
              },
              "operation": "member",
              "scope": "descendant"
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse nested subscript expression without leading expression (active-index)', function () {
    var path = jpql.parse("genereLists[.rating,[name,rating],.name]");
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
                      "value": "rating"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "active_position",
                "value": "{{$index}}"
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
                            "value": "name"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "rating"
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
                "type": "active_position",
                "value": "{{$index}}"
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
                "type": "active_position",
                "value": "{{$index}}"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });


  test('parse list of (longer) nested path components list', function () {
    var path = jpql.parse("$.store.book[*][0.author..name,1.author..name,2.author..name,3.author..name]");
    assert.deepEqual(path, [
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
          "type": "wildcard",
          "value": "*"
        },
        "operation": "subscript",
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
                      "value": "author"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    },
                    "operation": "member",
                    "scope": "descendant|branch"
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
                      "type": "identifier",
                      "value": "author"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    },
                    "operation": "member",
                    "scope": "descendant|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "numeric_literal",
                "value": 1
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "author"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    },
                    "operation": "member",
                    "scope": "descendant|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "numeric_literal",
                "value": 2
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "author"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "name"
                    },
                    "operation": "member",
                    "scope": "descendant|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "numeric_literal",
                "value": 3
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

test('parse list of single nested subscript component with leading nested path component', function () {
    var path = jpql.parse('$.store.book[0.author[main,co][..name[first,last],..twitter]]');
    assert.deepEqual(path, [
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
        "branch": {
          "path": [
            {
              "expression": {
                "type": "identifier",
                "value": "author"
              },
              "operation": "member",
              "scope": "child|branch"
            },
            {
              "expression": {
                "type": "union",
                "value": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "main"
                    }
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "co"
                    }
                  }
                ]
              },
              "operation": "subscript",
              "scope": "child|branch"
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
                                  "value": "first"
                                }
                              },
                              {
                                "expression": {
                                  "type": "identifier",
                                  "value": "last"
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
                      "type": "identifier",
                      "value": "name"
                    },
                    "operation": "member",
                    "scope": "descendant"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "twitter"
                    },
                    "scope": "descendant"
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
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[X] all books [author,title] via list of subscript expression with first level STAR expression', function() {
    var results = jpql.parse('$..book[*.title,*.price]');
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
                "type": "wildcard",
                "value": "*"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "wildcard",
                "value": "*"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[X] all books [author,title] via list of subscript expression with first level filter expression', function() {
    var results = jpql.parse('$..book[?(@.isbn).title,?(@.isbn).price]');
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
                "type": "filter_expression",
                "value": "?(@.isbn)"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "filter_expression",
                "value": "?(@.isbn)"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[X] all books [author,title] via list of subscript expression with first level slice expression', function() {
    var results = jpql.parse('$..book[1:2.title,3:4.price]');
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
                "type": "slice",
                "value": "1:2"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "slice",
                "value": "3:4"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[X] all books [author,title] via list of subscript expression with first level active slice expression', function() {
    var results = jpql.parse('$..book[({@.length-3}):({@.length-2}).title,({@.length-2}):({@.length-1}).title.price]');
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
                "type": "slice|active",
                "value": [
                  "({@.length-3})",
                  "({@.length-2})",
                  1
                ]
              }
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
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "slice|active",
                "value": [
                  "({@.length-2})",
                  "({@.length-1})",
                  1
                ]
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[X] all books [author,title] via list of subscript expression with first level script expression', function() {
    var results = jpql.parse('$..book[(@.length-2).title,(@.length-1).price]');
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
                "type": "script_expression",
                "value": "(@.length-2)"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "script_expression",
                "value": "(@.length-1)"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[X] all books [author,title] via list of subscript expression with first level active script expression', function() {
    var results = jpql.parse('$..book[({@.length-2}).title,({@.length-1}).price]');
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
                "type": "script_expression|active",
                "value": "({@.length-2})"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "script_expression|active",
                "value": "({@.length-1})"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[X] all books [author,title] via list of subscript expression with first level $root back reference expression', function() {
    var results = jpql.parse('$..book[$.0.title,$.1.price]');
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
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "numeric_literal",
                      "value": 0
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  },
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
                "type": "root",
                "value": "$$"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "numeric_literal",
                      "value": 1
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
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
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[Y] all books [author,title] via list of subscript expression with first level call expression -> active position anchor', function() {
    var results = jpql.parse('$..book[(delay: 100).title,(delay: 100 ).price]');
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
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "call_expression",
                      "value": {
                        "params": {
                          "delay": "100"
                        }
                      }
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  },
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
                "type": "active_position",
                "value": "{{$index}}"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "call_expression",
                      "value": {
                        "params": {
                          "delay": "100 "
                        }
                      }
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "active_position",
                "value": "{{$index}}"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[Y] all books [author,title] via list of subscript expression with first level call expression -> active position anchor', function() {
    var results = jpql.parse('$..book[(delay: 100).title,(delay: 100 ).price]');
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
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "call_expression",
                      "value": {
                        "params": {
                          "delay": "100"
                        }
                      }
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  },
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
                "type": "active_position",
                "value": "{{$index}}"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "call_expression",
                      "value": {
                        "params": {
                          "delay": "100 "
                        }
                      }
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "active_position",
                "value": "{{$index}}"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[?] in call expression, spaces are illegal between the opening ( and the key, and between the key and the ":", parse as script expression', function() {
    var results = jpql.parse('$..book[( delay: 100).title,( delay: 100 ).price]');
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
                "type": "script_expression",
                "value": "( delay: 100)"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "price"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "script_expression",
                "value": "( delay: 100 )"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('[Y] subscript-style call expression with identifier style key', function() {
    var results = jpql.parse('$..book(take: 2).title'); //subscript style call
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
          "type": "call_expression",
          "value": {
            "params": {
              "take": "2"
            }
          }
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

  test('[negative] subscript-style call expression with double quote string style key throws', function() {
    assert.throws(function(){jpql.parse('$..book("take": 2).title')}); //subscript style call
  });

  test('[negative] subscript-style call expression with single quote string style key throws', function() {
    assert.throws(function(){jpql.parse("$..book('take': 2).title")}); //subscript style call
  });

  test('[negative] subscript-style call expression with integer literal style key throws', function() {
    assert.throws(function(){jpql.parse("$..book(0: 2).title")}); //subscript style call
  });

  test('[?] subscript-style call expression with keyword literal style key coerces into string', function() {
    var results = jpql.parse("$..book(true: 2).title"); //subscript style call
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
          "type": "call_expression",
          "value": {
            "params": {
              "true": "2"
            }
          }
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

  test('[Y] just a member followed by a script expression, while implementation can produce the same result, the parser does not consider this a call expression, not to be confused with book(take: 2)', function() {
    var results = jpql.parse('$..book.take.(2).title'); //subscript style call
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
          "value": "take"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "script_expression",
          "value": "(2)"
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

  test('[negative] script expression is cannot switch places with a call expression', function() {
    assert.throws(function(){jpql.parse('$..book.take(2).title')}); //subscript style call
  });

  test('[X] descendant call expression', function() {
    var results = jpql.parse('$.store.*..(take: 1).name'); //first of each category
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
          "type": "wildcard",
          "value": "*"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "call_expression",
          "value": {
            "params": {
              "take": "1"
            }
          }
        },
        "operation": "subscript",
        "scope": "descendant"
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

  test('[X] member call expression throws', function() {
    assert.throws(function(){jpql.parse('$.store.book.(take: 2).title')}); //member style calls are meaningless
  });

  test('[X] active script expressions listables are still members :: SCRIPT', function() {
    var results = jpql.parse('$..book.(@.length-1).title');
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
          "type": "script_expression",
          "value": "(@.length-1)"
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

  test('[X] active script expressions listables are still members :: STAR', function() {
    var results = jpql.parse('$..book.*.title');
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
          "type": "wildcard",
          "value": "*"
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

  test('[X] active script expressions listables are still members :: ACTIVE_SCRIPT', function() {
    var results = jpql.parse('$..book.({@.length-1}).title');
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
          "type": "script_expression|active",
          "value": "({@.length-1})"
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


});
