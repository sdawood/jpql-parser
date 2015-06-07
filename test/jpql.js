var assert = require('chai').assert;
var jpql = new require('../lib/index')();
var util = require('util');
/**
 * graphqlite + json path
 jsongpath.parse(`
 node(id: 123) {
  id,
    name,
    birthdate {
    month,
      day,
  },
  friends(first: 1) {
    cursor,
      edges {
      node {
        name
      }
    }
  }
}
 `)
 */
 var graphqlite = "node(id: 123) { id, name, birthdate { month, day }, friends(first: 1) { cursor, edges { node { name } } } }"
// WHY NOT
var jsongpath = "node(id: 123) [ id, name, birthdate [ month, day ], friends(first: 1) [ cursor, edges [ node [ name ] ] ] ]"
// YES REALLY. WITH THE SPACES


suite('extended-jsonpath#parse', function() {

  test('parse path with leading member component succeeds', function() {
    var path = jpql.parse('.store');
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "store"
        },
        "operation": "member",
        "scope": "child"
      }
    ]);
  });

  test('parse path with leading descendant member succeeds', function() {
    var path = jpql.parse('..store');
    assert.deepEqual(path, [
      {
        "expression": {
          "type": "identifier",
          "value": "store"
        },
        "operation": "member",
        "scope": "descendant"
      }
    ]);
  });

  test('parse path for the first two books via negative slices', function() {
    var path = jpql.parse('$..book[-3:-2:-1]');

    assert.deepEqual(path, [
      { expression: { type: 'root', value: '$' } },
      { operation: 'member', scope: 'descendant', expression: { type: 'identifier', value: 'book' } },
      { operation: 'subscript', scope: 'child', expression: { type: 'slice', value: '-3:-2:-1' } }
    ])
  });

  test('parse path for the first two books via negative union', function() {
    /** the semantics of negative indexes is an implementation decision */
    var path = jpql.parse('$..book[-3,-2]');

    assert.deepEqual(path, [
      { expression: { type: 'root', value: '$' } },
      { operation: 'member', scope: 'descendant', expression: { type: 'identifier', value: 'book' } },
      { operation: 'subscript', scope: 'child', expression: { type: 'union', value: [ { expression: { type: 'numeric_literal', value: -3} }, { expression: { type: 'numeric_literal', value: -2} } ] } }
    ])
  });



});

suite('extended-jsonpath#parse-negative', function() {

  test('leading script throws', function() {
    assert.doesNotThrow(function() { var path = jpql.parse('()') })
  });


});
