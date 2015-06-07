var JisonParser = require('jison').Parser;
var grammar = require('./jpql-grammar');
var _ = require('lodash');
var assert = require('assert');

var Parser = function() {

  var parser = new JisonParser(grammar);

  parser.yy.ast = _ast;
  _ast.initialize();
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

var _ast = {

  initialize: function() {
    this._nodes = [];
    this._node = {};
    this._stashes = [];
    this._active_position = { expression: { type: "active_position", value: "{{$index}}" } };
  },

  set: function(props) {
    _.merge(this._node, props);
    return this._node;
  },

  node: function(obj) {
    if (arguments.length) this._node = _.merge({}, obj); // no reference attached
    return this._node;
  },

  push: function() {
    this._nodes.push(this._node);
    this._node = {};
  },

  stash: function(nodes) {
    assert(_.isArray(nodes));
    var nodesClone = nodes.map(function(node) { return _.merge({}, node)}); //we want no circular references or caller code modifying the node
    Array.prototype.push.apply(this._stash(), nodesClone);
  },

  stashClone: function() {
    return _.merge([], this._stash());
  },

  stashPop: function() {
    var _stash = _.merge([], this._stashes.pop());
    return _stash;
  },

  stashPush: function(nodes) {
    assert(_.isArray(nodes));
    this._stashes.push([]);
    this.stash(nodes);
  },

  _stash: function() {
    return this._stashes[this._stashes.length - 1];
  },

  pop: function() {
    var _node = this._node;
    this._node = {};
    return _node;
  },

  unshift: function() {
    this._nodes.unshift(this._node);
    this._node = {};
  },

  yield: function() {
    var _nodes = this._nodes;
    this.initialize();
    return _nodes;
  },

  concatAll: function(arrayOfArray) {
    var results = [];
    arrayOfArray.forEach(function(subArray) {
      results.push.apply(results, subArray);
    });
    return results;
  },

  merge: function(dest, source) {
    return this.clone(_.merge(dest, source));
  },

  clone: function(source) {
    return _.merge({}, source);
  },

  active_position: function() {
    return _.merge({}, this._active_position);
  },

  rollIntoParent: function(parent, branch) {
    var scopedBranch = _.map(branch, function(component) { return _.merge(_.merge({}, component), { scope: component.scope ? component.scope + "|" + "branch" : "branch" })});
    parent.branch = { path: scopedBranch };
    _.merge(parent.branch, { scope: "branch" });
    return parent;
  },

  unescapeDoubleQuotes: function(string) {
    return string.replace(/\\"/g, '"');
  },
  unescapeSingleQuotes: function(string) {
    return string.replace(/\\'/g, "'");
  }
};
