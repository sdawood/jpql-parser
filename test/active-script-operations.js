var assert = require('assert');
var jpql = new require('../')();
var util = require('util');

suite('jsonpath#active-script-operations', function() {

  test('[1] active script expression operations ({}), default is GET', function() {
    var results = jpql.parse('$..book[({@.length-1}).title]');
    assert.deepEqual(results, [false]);
  });

  test('[2] active script expression operations with splat results behavior (*{}), default is GET', function() {
    var results = jpql.parse('$..book[(*{[@.length-1,@.length-2]}).title]');
    assert.deepEqual(results, [false]);
  });

  test('[3] active script expression operations with splat results behavior is equivalent to promoting the results into list of scripts (*{}), default is GET', function() {
    var results = jpql.parse('$..book[ ({@.length-1)}, ({@.length-2}) ].title]');
    assert.deepEqual(results, [false]);
  });

  test('[4] [async] active script expression operations with take(10) splat results behavior (#(n)*{}), default is GET', function() {
    var results = jpql.parse('$..book[(#(2)*{[@.length-1,@.length-2]}).title]');
    assert.deepEqual(results, [false]);
  });


  test('[5] active script expression operations with argument ({}):({}), default "~" (POST or PUT)', function() {
    var results = jpql.parse('$..book[?(@.title===null)].({title}):({"Not Available"})');
    assert.deepEqual(results, [false]);
  });

  test('[6] active script expression operations with argument ({}):({[]}) and array value, default "~" (POST or PUT), implementation should concat or push value to existing array if any', function() {
    var results = jpql.parse('$..book[?(@.title===null)].({tags}):({["Not Available"]})');
    assert.deepEqual(results, [false]);
  });

  test('[7] active script expression operations with argument (+{}):({}), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal', function() {
    var results = jpql.parse('$..book[?(@.title===null)].(+{tags}):({["Not Available"]})');
    assert.deepEqual(results, [false]);
  });

 test('[8] [computed active script argument] active script expression operations with computed active script argument  (+{}):(={ @ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)].(+{fullName}):(={' +
      '@.firstName + " " + @.lastName' +
      '})');
    assert.deepEqual(results, [false]);
  });

 test('[9] [async computed nested $ path result] active script expression operations with computed nested path argument with reference to true root (+{}:=#{ $ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)].(+{fullName}):(=#{' +
      '$..book[?(@.fulleName===null)][firstName, lastName]' +
      '})');
    assert.deepEqual(results, [false]);
  });

 test('[10] [async subscribe to nested @$ path result] active script expression operations with computed nested path argument with reference to script context "@$" (+{}):(=#{ @$ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)].(+{fullName}):(#={@$[firstName, lastName]})');
    assert.deepEqual(results, [false]);
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
    var results = jpql.parse('$..book[?(@.fulleName===null)].(+tag{fullName}):(=#{' +
      '({@@.firstName + " " + @@.lastName})' +
      '})');
    assert.deepEqual(results, [false]);
  });

 test('[13] [async subscribe to component via active script optation take (10) (#(n){@})', function() {
    var results = jpql.parse('$..book[?(@.discount)].(#(10){title})');
    assert.deepEqual(results, [false]);
  });

  test('[14] active script expression operations with argument ({}), set "=" (PUT), set overwrites existing key/value, implementation should warn or err if not found', function() {
    var results = jpql.parse('$..book[?(@.title===null)].(={tags}):({"Not Available"})');
    assert.deepEqual(results, [false]);
  });

  test('[15] active script expression operation without argument ({}), remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.parse('$..book.(-{fullName})');
    assert.deepEqual(results, [false]);
  });

  test('[6] filter expression followed by delete expression operation without argument ({}), key remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)][(-{fullName})]');
    assert.deepEqual(results, [false]);
  });

  test('[17] filter expression followed by delete expression operation without key or (-{}), partial remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.parse('$..book[?(@.fulleName===null)][(-{})]');
    assert.deepEqual(results, [false]);
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
    assert.deepEqual(results, [false]);
  });

  test('[22] parse mapping script, mergeAll (value or default if value is null or key does not exist) scenario, implementation chose to bind the script this reference to the partial instead of using "@', function() {
    var results = jpql.parse('$..book[fullName, ?(this.fulleName===null).(=>{"Not Available"})]');
    assert.deepEqual(results, [false]);
  });

 test('[23] parse mapping script, for this key return that value, key has to exist in the data source, Mocking and Defaults', function() {
    var results = jpql.parse('$..book.reviews.(#tagRetry{details}:#(10)=>{"Temporary Not Available"})');
    assert.deepEqual(results, [false]);
  });

 test('[24] parse mapping script, mergeAll value or default scenario, implementation chose to bind the script this reference to the partial instead of using "@', function() {
    var results = jpql.parse('$..book[fullName, (=>{@.fullName ? undefined : "Not Available"})]');
    assert.deepEqual(results, [false]);
  });

  test('[25] parse active script operation call receiving literal arguments', function() {
    var results = jpql.parse('$.store.book.(=>{push}):({ {"4": {title: "New Book"} } })');
    assert.deepEqual(results, [false]);
  });

  test('[26] parse active script operation call receiving computed argument', function() {
    var results = jpql.parse('$.store.(=>{decrement}:#tagExpired{$..book.onOffer[@.length-1]})');
    assert.deepEqual(results, [false]);
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
    var results = jpql.parse('$..category.sorted.(#take(10){action}).title]');
    assert.deepEqual(results, [false]);
  });

  test('[4] async: subscribe to path component updates, take top 10 splat action titles via active script operation "@(10)"', function() {
    var results = jpql.parse('$..category.sorted.(#(10)*{action, comedy}).title]');
    assert.deepEqual(results, [false]);
  });

  test('[5] async: subscribe to path component updates, take top 10 from preceding partial', function() {
    var results = jpql.parse('$..category.sorted.(#(10))');
    assert.deepEqual(results, [false]);
  });

})
