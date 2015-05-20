var util = require('util')
var assert = require('chai').assert;
var expect = require('chai').expect;
var jgp = require('../lib/index');
var traverse = require('traverse');


var __parse = jgp.parser.parse;

function pathsEqual(leftPath, rightPath) {
    assert.equal(JSON.stringify(leftPath), JSON.stringify(rightPath));
}

function filter(obj, expression) {
  var leaves = traverse(obj).reduce(function (acc, x) {
    if (this.isLeaf && this.key === 'value') acc.push(x);
    return acc;
  }, []);
  return leaves;
}

function values(pathAST) {
  return filter(pathAST, function(node) { return (this.isLeaf)});
}

describe("falcor#parse", function() {
    it('should parse JavaScript paths that combine identifier names and indexers', function() {
        var path = __parse("genreLists[0][0].name");
        pathsEqual(values(path), ["genreLists", 0, 0, "name"]);
    });

    it('should parse JavaScript paths that combine identifier names, indexers, and string keys', function() {
        var path = __parse("['genreLists'][0][0].name");
        pathsEqual(values(path), ["genreLists", 0, 0, "name"]);
    });

    it('should parse JavaScript paths that contain only indexers', function() {
        var path = __parse('["genreLists"][0][0]["name"]');
        pathsEqual(values(path), ["genreLists", 0, 0, "name"]);
    });

    it('should parse JavaScript paths that contain only identifier names', function() {
        var path = __parse('genreLists.length');
        pathsEqual(values(path), ["genreLists", "length"]);
    });

    it('should parse "[" and "]" characters inside strings in indexers', function() {
        var path = __parse("['genre][Lists'][0][0].name");
        pathsEqual(values(path), ['genre][Lists', 0, 0, "name"]);
    });

    it('should parse apostrophe strings containing quotes In indexers', function() {
        var path = __parse("['genre\"Lists'][0][0].name");
        pathsEqual(values(path), ['genre"Lists', 0, 0, "name"]);
    });

    it('should parse strings containing apostrophes in indexers', function() {
        var path = __parse('["genre\'Lists"][0][0].name');
        pathsEqual(values(path), ["genre'Lists", 0, 0, "name"]);
    });

    it('should parse escaped quote in string', function() {
        var path = __parse('["genre\\"Lists"][0][0].name');
        pathsEqual(values(path), ['genre"Lists', 0, 0, "name"]);
    });

    it('should parse escaped apostrophe in apostrophe string', function() {
        var path = __parse("['genre\\'Lists'][0][0].name");
        pathsEqual(values(path), ["genre'Lists", 0, 0, "name"]);
    });

    it('should allow JavaScript keywords in indexer string', function() {
        var path = __parse("['var'][0][0]['return']");
        pathsEqual(values(path), ['var', 0, 0, 'return']);
    });

    it('should parse valid ES5 identifier names that contain strange (but legal) characters (see https:\/\/mathiasbynens.be\/notes\/javascript-identifiers)', function() {
        var path = __parse('π.ಠ_ಠ.ლ_ಠ益ಠ_ლ.λ.\u006C\u006F\u006C\u0077\u0061\u0074.foo\u200Cbar.〱〱.price_9̶9̶_89.Ⅳ.$123._._0');
        pathsEqual(values(path), ['π','ಠ_ಠ','ლ_ಠ益ಠ_ლ','λ','\u006C\u006F\u006C\u0077\u0061\u0074','foo\u200Cbar','〱〱','price_9̶9̶_89','Ⅳ','$123','_','_0']);
    });

    it('should parse inclusive and exclusive ranges in indexers. Inclusive ranges should use the "to" field, and exclusive ranges should use the "length" field.', function() {
//        var path = __parse("genreLists[0..1][0...1].name");
        var path = __parse("genreLists[0:1][0:1].name");
//        pathsEqual(values(path), ["genreLists", {from: 0, to: 1}, {from:0, length:1-0}, "name"]);
        pathsEqual(values(path), ["genreLists","0:1","0:1","name"]);
    });

    it('Should parse null, true, false, and undefined keys and should not coerce it into a string', function() {
        var path = __parse("genreLists[null][true][false][undefined]");
        pathsEqual(values(path), ["genreLists", null, true, false, undefined]);
    });

    it('Null should _not_ be a valid identifier', function() {
        expect(function() {
            __parse("genreLists.null")
        }).to.throw();
    });

    it('True should _not_ be a valid identifier', function() {
        expect(function() {
            __parse("genreLists.true")
        }).to.throw();
    });

    it('False should _not_ be a valid identifier', function() {
        expect(function() {
            __parse("genreLists.false")
        }).to.throw();
    });

    it('Should parse indexers containing both ranges and keys', function() {
//        var path = __parse("genreLists[0...3, 1][0...3, 5, 6..9].name")
        var path = __parse("genreLists[0:3,1][0:3,5,6:9].name")
//        pathsEqual(values(path), ["genreLists", [{from: 0, length: 3-0}, 1], [{from:0, length:3-0}, 5, {from:6, to: 9}], "name"]);
        pathsEqual(values(path), ["genreLists","0:3",1,"0:3",5,"6:9","name"]);
    });

    it('Should parse path with only indexers, where some indexers contain both ranges and keys', function() {
//        var path = __parse("['genreLists'][0...3, 1][0...3, 5, 6..9]['name']")
        var path = __parse("['genreLists'][0:3,1][0:3,5,6:9]['name']")
//        pathsEqual(values(path), ["genreLists", [{from: 0, length: 3-0}, 1], [{from:0, length:3-0}, 5, {from:6, to: 9}], "name"]);
        pathsEqual(values(path), ["genreLists","0:3",1,"0:3",5,"6:9","name"]);
    });

    it('Should parse path with only indexers, where some indexers contain both ranges and keys and some contain only keys', function() {
//        var path = __parse("['genreLists'][0...3, '1'][0...3, 5, 6..9]['name', 'rating']")
        var path = __parse("['genreLists'][0:3,'1'][0:3,5,6:9]['name','rating']")
//        pathsEqual(values(path), ["genreLists", [{from: 0, length: 3-0}, "1"], [{from:0, length:3-0}, 5, {from:6, to: 9}], ["name", "rating"]]);
        pathsEqual(values(path), ["genreLists","0:3","1","0:3",5,"6:9","name","rating"]);
    });

    ["break", "case", "catch", "continue", "debugger", "default", "delete", "do", "else", "finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "class", "const", "enum", "export", "extends", "import", "super"].
        forEach(function(keyword) {
            it('should reject reserved word "' + keyword + '"" as an identifier.', function() {
                expect(function() {
                    __parse(keyword + '[0]');
                }).to.throw();
            });
        });

    it('Ranges can have smaller "to" values than "from" values. Technically this is illegal, but it is not the parser\'s job to enforce this restriction.', function() {
//        var path = __parse("genreLists[3...2][3..2]['name']")
        var path = __parse("genreLists[3:2][3:2]['name']")
//        pathsEqual(values(path), ["genreLists", {from: 3, length: 2-3}, {from:3, to: 2}, "name"]);
        pathsEqual(values(path), ["genreLists","3:2","3:2","name"]);
    });

    it('should reject Arrays inside of indexers', function() {
        expect(function() {
            __parse("genreLists[0...3, [1,2]]['rating']")
        }).to.throw();
    });

    it('should reject ranges that contain doubles as the "to" portion', function() {
        expect(function() {
            __parse("genreLists[0...3.2]['rating']")
        }).to.throw();
    });

    it('should reject ranges that contain non-number values', function() {
        expect(function() {
            __parse("genreLists[0...hello]['rating']")
        }).to.throw();
    });

   it('should reject ranges that contain doubles as the "from" portion', function() {
        expect(function() {
            __parse("genreLists[3.2...0]['rating']")
        }).to.throw();
    });

    it('should reject identifier names found in indexers outside of quotes', function() {
      var path = __parse("genreLists[rating]");
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
            "type": "identifier",
            "value": "rating"
          },
          "operation": "subscript",
          "scope": "child"
        }
      ]);
    });

    it('x - should reject numbers as identifiers', function() {
        var path = __parse("234[rating]");
        assert.deepEqual(path, [
          {
            "expression": {
              "type": "numeric_literal",
              "value": 234
            },
            "operation": "member",
            "scope": "child"
          },
          {
            "expression": {
              "type": "identifier",
              "value": "rating"
            },
            "operation": "subscript",
            "scope": "child"
          }
        ]);
    });

});
