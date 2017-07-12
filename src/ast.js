var _ = require('lodash');
var assert = require('assert');


var AST = function() {
  this.initialize();
};

AST.prototype.initialize = function() {
    this._nodes = [];
    this._node = {};
    this._stashes = [];
    this._active_position = { expression: { type: "active_position", value: "{{$index}}" } };
};

AST.prototype.set = function(props) {
    _.merge(this._node, props);
    return this._node;
};

AST.prototype.node = function(obj) {
    if (arguments.length) this._node = _.merge({}, obj); // no reference attached
    return this._node;
};

AST.prototype.push = function() {
    this._nodes.push(this._node);
    this._node = {};
};

AST.prototype.stash = function(nodes) {
    assert(_.isArray(nodes));
    var nodesClone = nodes.map(function(node) { return _.merge({}, node)}); //we want no circular references or caller code modifying the node
    Array.prototype.push.apply(this._stash(), nodesClone);
};

AST.prototype.stashClone = function() {
    return _.merge([], this._stash());
};

AST.prototype.stashPop = function() {
    var _stash = _.merge([], this._stashes.pop());
    return _stash;
};

AST.prototype.stashPush = function(nodes) {
    assert(_.isArray(nodes));
    this._stashes.push([]);
    this.stash(nodes);
};

AST.prototype._stash = function() {
    return this._stashes[this._stashes.length - 1];
};

AST.prototype.pop = function() {
    var _node = this._node;
    this._node = {};
    return _node;
};

AST.prototype.unshift = function() {
    this._nodes.unshift(this._node);
    this._node = {};
};

AST.prototype.yield = function() {
    var _nodes = this._nodes;
    this.initialize();
    return _nodes;
};

AST.prototype.concatAll = function(arrayOfArray) {
    var results = [];
    arrayOfArray.forEach(function(subArray) {
      results.push.apply(results, subArray);
    });
    return results;
};

AST.prototype.merge = function(dest, source) {
    return this.clone(_.merge(dest, source));
};

AST.prototype.clone = function(source) {
    return _.merge({}, source);
};

AST.prototype.active_position = function() {
    return _.merge({}, this._active_position);
};

AST.prototype.rollIntoParent = function(parent, branch) {
    var scopedBranch = _.map(branch, function(component) { return _.merge(_.merge({}, component), { scope: component.scope ? component.scope + "|" + "branch" : "branch" })});
    parent.branch = { path: scopedBranch };
    _.merge(parent.branch, { scope: "branch" });
    return parent;
};

AST.prototype.unescapeDoubleQuotes = function(string) {
    return string.replace(/\\"/g, '"');
};

AST.prototype.unescapeSingleQuotes = function(string) {
    return string.replace(/\\'/g, "'");
};

AST.prototype.parseRegularExpressionLiteral = function(literal) {
  var last = literal.lastIndexOf("/");
  var body = literal.substring(1, last);
  var flags = literal.substring(last + 1);

  return new RegExp(body, flags);
};

AST.prototype.parseNumericLiteral = function(literal) {
  if (literal.charAt(0) === "0") {
    if (literal.charAt(1).toLowerCase() === "x") {
      return parseInt(literal, 16);
    } else {
      return parseInt(literal, 8);
    }
  } else {
    return Number(literal);
  }
};

module.exports = AST;