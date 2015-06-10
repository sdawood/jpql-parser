var JisonParser = require('jison').Parser;
//var grammar = require('./jpql-grammar');
//var grammarJSON = require('../json2jison\ transition/jpql-grammar2');

var Parser = function() {
  var fs = require('fs');
  var jisonGrammar = fs.readFileSync(require('path').resolve(__dirname, './jpql-grammar.wip.jison'), 'utf-8');
//  var parser = new JisonParser(grammar);
//  var parser = new JisonParser(grammarJSON);
  var parser = new JisonParser(jisonGrammar);
  var AST = require('./ast');
  parser.yy.ast = new AST();
  return { parse: function(path) {
    try {
      return parser.parse(path);
    } catch (err) {
      parser.yy.ast.initialize();
      throw err;
    }
  }};

};

module.exports = Parser;
