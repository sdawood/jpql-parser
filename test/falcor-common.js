var assert = require('chai').assert;
var jpql = new require('../lib/index')();

suite('falcor#parse-common', function() {

  test('should parse identifier name in indexers', function() {
    var path = jpql.parse("genreLists[x][y][z][w]");
    assert.deepEqual(path, [
      { "expression": { "type": "identifier", "value": "genreLists" }, "operation": "member", "scope": "child" },
      { "expression": { "type": "identifier", "value": "x" }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "identifier", "value": "y" }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "identifier", "value": "z" }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "identifier", "value": "w" }, "operation": "subscript", "scope": "child" }]);
  });

  test('should parse null, true, false, and undefined keys and should not coerce it into a string', function() {
    var path = jpql.parse("genreLists[null][true][false][undefined]");
    assert.deepEqual(path, [
      { "expression": { "type": "identifier", "value": "genreLists" }, "operation": "member", "scope": "child" },
      { "expression": { "type": "keyword", "value": null }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "keyword", "value": true }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "keyword", "value": false }, "operation": "subscript", "scope": "child" },
      { "expression": { "type": "keyword", "value": null }, "operation": "subscript", "scope": "child" }]);

  });
});