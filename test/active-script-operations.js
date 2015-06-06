var assert = require('assert');
var jpql = new require('../')();
var util = require('util');

suite('jsonpath#active-script-operations', function() {

  test('active script expression operations ({}), default is GET', function() {
    var results = jpql.parse('$..book[({@.length-1}).title]');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operations with argument ({}), default "~" (POST or PUT)', function() {
    var results = jpql.parse('$..book.({@.title===null}).({title}:{"Not Available"})]');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operations with argument ({}) and array value, default "~" (POST or PUT), implementation should concat or push value to existing array if any', function() {
    var results = jpql.parse('$..book.({@.title===null}).({tags}:{["Not Available"]})]');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operations with argument ({}), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal', function() {
    var results = jpql.parse('$..book.({@.title===null}).(+{tags}:{["Not Available"]})]');
    assert.deepEqual(results, [false]);
  });

 test('[computed active script argument] active script expression operations with computed active script argument  (+{}:={ @ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book.({@.fulleName===null}).(+{fullName}:={' +
      '@.firstName + " " + @.lastName' +
      '})');
    assert.deepEqual(results, [false]);
  });

 test('[async computed nested $ path result] active script expression operations with computed nested path argument with reference to true root (+{}:=@{ $.({$.@}) }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book.({@.fulleName===null}).(+{fullName}:=@{' +
      '$..book.({@.fulleName===null})[firstName, lastName]' +
      '})');
    assert.deepEqual(results, [false]);
  });

 test('[async subscribe to nested @$ path result] active script expression operations with computed nested path argument with reference to script context "@$" (+{}:=@{ $.({@$}) }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book.({@.fulleName===null}).(+{fullName}:=@{' +
      '@$[firstName, lastName]' +
      '})');
    assert.deepEqual(results, [false]);
  });

 test('parse nested path with context root reference "@$" and root reference "$", used by active script handler implementation for path lazy evaluation', function() {
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

 test('[async subscribe to nested path component == active script result] active script expression operations with computed nested active script expression with reference to parent script context value (+{}:=@{ ({@@}) }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book.({@.fulleName===null}).(+{fullName}:=@{' +
      '({@@.firstName + " " + @@.lastName})' +
      '})');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operations with argument ({}), set "=" (PUT), set overwrites existing value, implementation should warn or err if not found', function() {
    var results = jpql.parse('$..book.({@.title===null}).(+{tags}:{"Not Available"})]');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operation without argument ({}), remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.parse('$..book.(-{@.title===null})]');
    assert.deepEqual(results, [false]);
  });

})

suite('jsonpath#subscribe and take', function() {
  test('async: subscribe to path component updates', function() {
    var results = jpql.parse('$..book.(@{@.title===null})]');
    assert.deepEqual(results, [false]);
  });

  test('async: subscribe to path component updates, take 10', function() {
    var results = jpql.parse('$..book.(@(10){@.title===null})]');
    assert.deepEqual(results, [false]);
  });
})
