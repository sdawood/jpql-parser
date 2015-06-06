var assert = require('chai').assert;
var jpql = new require('../lib/index')();

suite('graphql#parse-common', function() {

  test('Feature graphqlite npm example', function () {
    var path = jpql.parse("node(id: 123){id,name,birthdate{month,day}, friends(first: 1){cursor,edges{node{name}}}}");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "node"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "call_expression",
          "value": {
            "params": {
              "id": "123"
            }
          }
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
              "expression": {
                "type": "identifier",
                "value": "id"
              }
            },
            {
              "expression": {
                "type": "identifier",
                "value": "name"
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
                            "value": "month"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "day"
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
                "value": "birthdate"
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
                          "first": "1"
                        }
                      }
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "union",
                      "value": [
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "cursor"
                          }
                        },
                        {
                          "branch": {
                            "path": [
                              {
                                "branch": {
                                  "path": [
                                    {
                                      "expression": {
                                        "type": "identifier",
                                        "value": "name"
                                      },
                                      "operation": "subscript",
                                      "scope": "child|branch"
                                    }
                                  ],
                                  "scope": "branch"
                                },
                                "expression": {
                                  "type": "identifier",
                                  "value": "node"
                                },
                                "operation": "subscript",
                                "scope": "child|branch"
                              }
                            ],
                            "scope": "branch"
                          },
                          "expression": {
                            "type": "identifier",
                            "value": "edges"
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
                "value": "friends"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

 test('Feature graphqlite npm example returning union as an Observable', function () {
    var path = jpql.parse("node(id: 123){id,name,birthdate{month,day}, friends(first: 1).observable{edges{node{name}}}}");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "node"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "call_expression",
          "value": {
            "params": {
              "id": "123"
            }
          }
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
              "expression": {
                "type": "identifier",
                "value": "id"
              }
            },
            {
              "expression": {
                "type": "identifier",
                "value": "name"
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
                            "value": "month"
                          }
                        },
                        {
                          "expression": {
                            "type": "identifier",
                            "value": "day"
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
                "value": "birthdate"
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
                          "first": "1"
                        }
                      }
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "observable"
                    },
                    "operation": "member",
                    "scope": "child|branch"
                  },
                  {
                    "branch": {
                      "path": [
                        {
                          "branch": {
                            "path": [
                              {
                                "expression": {
                                  "type": "identifier",
                                  "value": "name"
                                },
                                "operation": "subscript",
                                "scope": "child|branch"
                              }
                            ],
                            "scope": "branch"
                          },
                          "expression": {
                            "type": "identifier",
                            "value": "node"
                          },
                          "operation": "subscript",
                          "scope": "child|branch"
                        }
                      ],
                      "scope": "branch"
                    },
                    "expression": {
                      "type": "identifier",
                      "value": "edges"
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "identifier",
                "value": "friends"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse branches of listable subscript expressions with active index with new lines', function () {
    var path = jpql.parse("node[123][\n" +
        "friends[\n" +
          "[10:11],[110:111]]\n" +
        "]");
    assert.deepEqual(path, [
      { "expression": { "type": "identifier", "value": "node" }, "operation": "member", "scope": "child" },
      { "expression": { "type": "numeric_literal", "value": 123 }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "identifier", "value": "friends" }, "operation": "subscript", "scope": "child" , "branch":
        { "path": [ { "expression": { "type": "union", "value": [
          { "expression": { "type": "active_position", "value": "{{$index}}" }, "branch": { "path": [
            { "expression": { "type": "slice", "value": "10:11" }, "operation": "subscript", "scope": "child|branch" }
            ],
            "scope": "branch" } },
          { "expression": { "type": "active_position", "value": "{{$index}}" }, "branch": { "path": [
              { "expression": { "type": "slice", "value": "110:111" }, "operation": "subscript", "scope": "child|branch" }
              ],
              "scope": "branch" }
             } ] },
          "operation": "subscript", "scope": "child|branch" } ],
        "scope": "branch" } }
    ]);
  });

  test('parse branches of listable subscript expressions with index with spaces', function () {
    var path = jpql.parse("node [ 123 ] [ friends \t[ 0 [ 10:11 ], 1 \t[ 110:111 ] ] ]");
    assert.deepEqual(path, [
      { "expression": { "type": "identifier", "value": "node" }, "operation": "member", "scope": "child" },
      { "expression": { "type": "numeric_literal", "value": 123 }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "identifier", "value": "friends" }, "operation": "subscript", "scope": "child" , "branch":
      { "path": [ { "expression": { "type": "union", "value": [
        { "expression": { "type": "numeric_literal", "value": 0 }, "branch": { "path": [
          { "expression": { "type": "slice", "value": "10:11" }, "operation": "subscript", "scope": "child|branch" }
        ],
          "scope": "branch" } },
        { "expression": { "type": "numeric_literal", "value": 1 }, "branch": { "path": [
          { "expression": { "type": "slice", "value": "110:111" }, "operation": "subscript", "scope": "child|branch" }
        ],
          "scope": "branch" }
        } ] },
        "operation": "subscript", "scope": "child|branch" } ],
        "scope": "branch" } }
    ]);
  });

  test('parse branches of listable ACTIVE_SLICE subscript expressions with curvey {} subscripts', function () {
    var path = jpql.parse("node{123}{friends{{1:10},(@length-20):(@length-10),100}}");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "node"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "numeric_literal",
          "value": 123
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
                    "branch": {
                      "path": [
                        {
                          "expression": {
                            "type": "slice",
                            "value": "1:10"
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
                    "expression": {
                      "type": "slice|active",
                      "value": [
                        "(@length-20)",
                        "(@length-10)",
                        1
                      ]
                    }
                  },
                  {
                    "expression": {
                      "type": "numeric_literal",
                      "value": 100
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
          "value": "friends"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse branches of listable SCRIPT_EXPRESSION subscript expressions', function () {
    var path = jpql.parse("node[123][friends[[1:10],({@length-20}),100]]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "node"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "numeric_literal",
          "value": 123
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
                    "branch": {
                      "path": [
                        {
                          "expression": {
                            "type": "slice",
                            "value": "1:10"
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
                    "expression": {
                      "active": {
                        "map": {
                          "script": "{@length-20}",
                          "value": "({@length-20})"
                        },
                        "reduce": {},
                        "value": "({@length-20})"
                      },
                      "type": "script_expression|active",
                      "value": "({@length-20})"
                    }
                  },
                  {
                    "expression": {
                      "type": "numeric_literal",
                      "value": 100
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
          "value": "friends"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse branches of listable SCRIPT_EXPRESSION subscript expressions containing $ == root$ref', function () {
    var path = jpql.parse("rules['rule1','rule2',({@$.prefix + $.rule1})]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "rules"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
              "expression": {
                "type": "string_literal",
                "value": "rule1"
              }
            },
            {
              "expression": {
                "type": "string_literal",
                "value": "rule2"
              }
            },
            {
              "expression": {
                "active": {
                  "map": {
                    "script": "{@$.prefix + $.rule1}",
                    "value": "({@$.prefix + $.rule1})"
                  },
                  "reduce": {},
                  "value": "({@$.prefix + $.rule1})"
                },
                "type": "script_expression|active",
                "value": "({@$.prefix + $.rule1})"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse branch with leading subscript expression', function () {
    var path = jpql.parse("node[123][friends[[1:10],count]]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "node"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "numeric_literal",
          "value": 123
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
                    "branch": {
                      "path": [
                        {
                          "expression": {
                            "type": "slice",
                            "value": "1:10"
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
                    "expression": {
                      "type": "identifier",
                      "value": "count"
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
          "value": "friends"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse branch with leading descendant member expression', function () {
    var path = jpql.parse("node[123][friends[..*,count]]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "node"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "numeric_literal",
          "value": 123
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
                      "type": "wildcard",
                      "value": "*"
                    },
                    "scope": "descendant"
                  },
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "count"
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
          "value": "friends"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse branch with path member components', function () {
      var path = jpql.parse("node[123][name,boxshot.url,birthdate.day]");
      assert.deepEqual(path, [
        {
          "expression": {
            "type": "identifier",
            "value": "node"
          },
          "operation": "member",
          "scope": "child"
        },
        {
          "expression": {
            "type": "numeric_literal",
            "value": 123
          },
          "operation": "subscript",
          "scope": "child"
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
                "branch": {
                  "path": [
                    {
                      "expression": {
                        "type": "identifier",
                        "value": "url"
                      },
                      "operation": "member",
                      "scope": "child|branch"
                    }
                  ],
                  "scope": "branch"
                },
                "expression": {
                  "type": "identifier",
                  "value": "boxshot"
                }
              },
              {
                "branch": {
                  "path": [
                    {
                      "expression": {
                        "type": "identifier",
                        "value": "day"
                      },
                      "operation": "member",
                      "scope": "child|branch"
                    }
                  ],
                  "scope": "branch"
                },
                "expression": {
                  "type": "identifier",
                  "value": "birthdate"
                }
              }
            ]
          },
          "operation": "subscript",
          "scope": "child"
        }
      ]);
    });

  test('parse consecutive branch out inside subscript', function () {
    var path = jpql.parse("node[123][friends[cursor[1[name,age]],cursor[2[name,age]]]]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "node"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "numeric_literal",
          "value": 123
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
                    "branch": {
                      "path": [
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
                                        "value": "age"
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
                            "value": 1
                          },
                          "operation": "subscript",
                          "scope": "child|branch"
                        }
                      ],
                      "scope": "branch"
                    },
                    "expression": {
                      "type": "identifier",
                      "value": "cursor"
                    }
                  },
                  {
                    "branch": {
                      "path": [
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
                                        "value": "age"
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
                            "value": 2
                          },
                          "operation": "subscript",
                          "scope": "child|branch"
                        }
                      ],
                      "scope": "branch"
                    },
                    "expression": {
                      "type": "identifier",
                      "value": "cursor"
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
          "value": "friends"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse branch out and in inside subscript', function () {
    var path = jpql.parse("node[123][friends[1,2,3].name]");
    assert.deepEqual(path, [
      { "expression": { "type": "identifier", "value": "node" }, "operation": "member", "scope": "child" },
      { "expression": { "type": "numeric_literal", "value": 123 }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "identifier", "value": "friends" }, "branch": { "path": [
        { "expression": { "type": "union", "value": [
            { "expression": { "type": "numeric_literal", "value": 1 } },
            { "expression": { "type": "numeric_literal", "value": 2 } },
            { "expression": { "type": "numeric_literal", "value": 3 } }
          ] },
          "operation": "subscript", "scope": "child|branch" },
        { "expression": { "type": "identifier", "value": "name" }, "operation": "member", "scope": "child|branch" } ],
        "scope": "branch" },
        "operation": "subscript", "scope": "child" } ]);
  });

  test('parse branch with multiple path compnents', function () {
    var path = jpql.parse("node[123][friends..*.info[latest]..name]");
    assert.deepEqual(path, [
      { "expression": { "type": "identifier", "value": "node" }, "operation": "member", "scope": "child" },
      { "expression": { "type": "numeric_literal", "value": 123 }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "identifier", "value": "friends" }, "operation": "subscript", "scope": "child",
        "branch": { "path": [
          { "expression": { "type": "wildcard", "value": "*" }, "operation": "member", "scope": "descendant|branch" },
          { "expression": { "type": "identifier", "value": "info" }, "operation": "member", "scope": "child|branch" },
          { "expression": { "type": "identifier", "value": "latest" }, "operation": "subscript", "scope": "child|branch" },
          { "expression": { "type": "identifier", "value": "name" }, "operation": "member", "scope": "descendant|branch" }
        ],
        "scope": "branch" }} ]);
  });

  test('parse descendant path component inside subscript', function () {
    var path = jpql.parse("node[123][friends..name]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "node"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "numeric_literal",
          "value": 123
        },
        "operation": "subscript",
        "scope": "child"
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
              "scope": "descendant|branch"
            }
          ],
          "scope": "branch"
        },
        "expression": {
          "type": "identifier",
          "value": "friends"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse member path component inside subscript', function () {
    var path = jpql.parse("node[123][friends.count]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "node"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "numeric_literal",
          "value": 123
        },
        "operation": "subscript",
        "scope": "child"
      },
      {
        "branch": {
          "path": [
            {
              "expression": {
                "type": "identifier",
                "value": "count"
              },
              "operation": "member",
              "scope": "child|branch"
            }
          ],
          "scope": "branch"
        },
        "expression": {
          "type": "identifier",
          "value": "friends"
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse graphqlite npm example', function () {
    var path = jpql.parse("node[123][id,name,birthdate[month,day],friends[1[cursor,edges[node[name]]]]]");
    assert.deepEqual(path, [
      { "expression": { "type": "identifier", "value": "node" }, "operation": "member", "scope": "child" },
      { "expression": { "type": "numeric_literal", "value": 123 }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "union", "value": [
        { "expression": { "type": "identifier", "value": "id" } },
        { "expression": { "type": "identifier", "value": "name" } },
        { "expression": { "type": "identifier", "value": "birthdate" }, "branch": { "path": [
          { "expression": { "type": "union", "value": [
            { "expression": { "type": "identifier", "value": "month" } },
            { "expression": { "type": "identifier", "value": "day" } } ] },
            "operation": "subscript", "scope": "child|branch" } ],
          "scope": "branch" }},
        { "expression": { "type": "identifier", "value": "friends" }, "branch": { "path": [
          { "expression": { "type": "numeric_literal", "value": 1 }, "branch": { "path": [
            { "expression": { "type": "union", "value": [
              { "expression": { "type": "identifier", "value": "cursor" } },
              { "expression": { "type": "identifier", "value": "edges" }, "branch": { "path": [
                { "expression": { "type": "identifier", "value": "node" }, "branch": { "path": [
                  { "expression": { "type": "identifier", "value": "name" }, "operation": "subscript", "scope": "child|branch" } ],
                  "scope": "branch" },
                  "operation": "subscript", "scope": "child|branch" } ],
                "scope": "branch" } } ] }, "operation": "subscript", "scope": "child|branch" } ],
            "scope": "branch" },
            "operation": "subscript", "scope": "child|branch" } ],
          "scope": "branch" } } ] },
        "operation": "subscript", "scope": "child" }]);
  });

  test('parse single identifier names in indexers :: should parse nested subscript expressions', function () {
    var path = jpql.parse("genreLists[rating[average],top[1,2],subscription[expiry]]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "genreLists"
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
                      "value": "average"
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "identifier",
                "value": "rating"
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
                            "type": "numeric_literal",
                            "value": 1
                          }
                        },
                        {
                          "expression": {
                            "type": "numeric_literal",
                            "value": 2
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
                "value": "top"
              }
            },
            {
              "branch": {
                "path": [
                  {
                    "expression": {
                      "type": "identifier",
                      "value": "expiry"
                    },
                    "operation": "subscript",
                    "scope": "child|branch"
                  }
                ],
                "scope": "branch"
              },
              "expression": {
                "type": "identifier",
                "value": "subscription"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });

  test('parse list of identifier names in indexers :: should parse nested subscript expressions', function () {
    var path = jpql.parse("genreLists[rating,count,top[1,2,3,4],subscription]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "genreLists"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
              "expression": {
                "type": "identifier",
                "value": "rating"
              }
            },
            {
              "expression": {
                "type": "identifier",
                "value": "count"
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
                            "type": "numeric_literal",
                            "value": 1
                          }
                        },
                        {
                          "expression": {
                            "type": "numeric_literal",
                            "value": 2
                          }
                        },
                        {
                          "expression": {
                            "type": "numeric_literal",
                            "value": 3
                          }
                        },
                        {
                          "expression": {
                            "type": "numeric_literal",
                            "value": 4
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
                "value": "top"
              }
            },
            {
              "expression": {
                "type": "identifier",
                "value": "subscription"
              }
            }
          ]
        },
        "operation": "subscript",
        "scope": "child"
      }
    ]);
  });


  test('parse nested indexers :: should parse identifiers appearing immediately before an indexer as a receiver for the indexer as fields', function () {
    var path = jpql.parse("genreLists[x[0,1],y123456789y,z123456789z]");
    assert.deepEqual(path,[
      { "expression": { "type": "identifier", "value": "genreLists" }, "operation": "member", "scope": "child" },
      { "expression": { "type": "union", "value": [
        { "expression": { "type": "identifier", "value": "x" }, "branch": { "path": [
        { "expression": { "type": "union", "value": [
          { "expression": { "type": "numeric_literal", "value": 0 } },
          { "expression": { "type": "numeric_literal", "value": 1 } }
        ] },
          "operation": "subscript", "scope": "child|branch" } ],
        "scope": "branch" } },
        { "expression": { "type": "identifier", "value": "y123456789y" } },
        { "expression": { "type": "identifier", "value": "z123456789z" } }
        ] },
        "operation": "subscript", "scope": "child" } ]);
  });


  test('parse deep nested indexers :: should parse nested subscript expressions', function () {
    var path = jpql.parse("genreLists[x[0[1[2]]],y[0[1[2]]]]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "genreLists"
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
                    "branch": {
                      "path": [
                        {
                          "branch": {
                            "path": [
                              {
                                "expression": {
                                  "type": "numeric_literal",
                                  "value": 2
                                },
                                "operation": "subscript",
                                "scope": "child|branch"
                              }
                            ],
                            "scope": "branch"
                          },
                          "expression": {
                            "type": "numeric_literal",
                            "value": 1
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
                    "branch": {
                      "path": [
                        {
                          "branch": {
                            "path": [
                              {
                                "expression": {
                                  "type": "numeric_literal",
                                  "value": 2
                                },
                                "operation": "subscript",
                                "scope": "child|branch"
                              }
                            ],
                            "scope": "branch"
                          },
                          "expression": {
                            "type": "numeric_literal",
                            "value": 1
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
      }
    ]);
  });

  test('parse nested indexers :: parse path with comma separated subscript expressions produces active_position (should fail gracefully at query time)', function () {
    var path = jpql.parse("genreLists[x,[0],y,[0,1]]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "genreLists"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
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
                      "type": "numeric_literal",
                      "value": 0
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
              "expression": {
                "type": "identifier",
                "value": "y"
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
                            "type": "numeric_literal",
                            "value": 0
                          }
                        },
                        {
                          "expression": {
                            "type": "numeric_literal",
                            "value": 1
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

  test('parse nested indexers :: parse path with comma separated subscript expressions succeeds, a leading expression is not required in active position capturing mode', function () {
    var path = jpql.parse("genreLists[x,[0],y,[0,1]]");
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "genreLists"
        },
        "operation": "member",
        "scope": "child"
      },
      {
        "expression": {
          "type": "union",
          "value": [
            {
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
                      "type": "numeric_literal",
                      "value": 0
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
              "expression": {
                "type": "identifier",
                "value": "y"
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
                            "type": "numeric_literal",
                            "value": 0
                          }
                        },
                        {
                          "expression": {
                            "type": "numeric_literal",
                            "value": 1
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
});

suite('graphql#parse-negative', function() {

  test('FEATURE list of identifier names in indexers :: parse path with adjacent nestabed subscript throws', function () {
    assert.throws(function() { var path = jpql.parse("genreLists[top[1,2,3,4]top[1,2,3,4]]")});
  });

});

