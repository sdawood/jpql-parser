var assert = require('assert');
var macros = require('./jpql-macros');
var Parser = require('./parser');
var Handlers = require('./handlers');

var JSONPath = function() {
  this.initialize.apply(this, arguments);
};

JSONPath.prototype.initialize = function() {
  this.parser = new Parser();
//  this.handlers = new Handlers();
};

JSONPath.prototype.parse = function(string) {
  assert.ok(string, "we need a path");
  return this.parser.parse(string);
};

JSONPath.prototype._getNode = function(obj, path) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(Array.isArray(path), "we need a path array");

  return this.query(obj, this.stringify(path)).shift();
}

JSONPath.prototype.parent = function(obj, string) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");

  var node = this.nodes(obj, string)[0];
  var key = node.path.pop(); /* jshint unused:false */
  return this._getNode(obj, node.path);
}

JSONPath.prototype.apply = function(obj, string, fn) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");
  assert.equal(typeof fn, "function", "fn needs to be function")

  var nodes = this.nodes(obj, string);

  nodes.forEach(function(node) {
    var key = node.path.pop();
    var parent = this.value(obj, this.stringify(node.path));
    var val = node.value = fn.call(obj, parent[key]);
    parent[key] = val;
  }, this);

  return nodes;
}

JSONPath.prototype.value = function(obj, string, value) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");

  if (arguments.length >= 3) {
    var path = this.parser.parse(string);
    path = path.map(function(component) { return component.expression.value; });
    var self = this;
    var setValue = function(path, value) {
      var key = path.pop();
      var node = self._getNode(obj, path);
      if (!node) {
        setValue(path.concat(), typeof key === 'string' ? {} : []);
        node = self._getNode(obj, path);
      }
      node[key] = value;
    }
    setValue(path, value);
  }

  return this.query(obj, string)[0];
}

JSONPath.prototype.query = function(obj, string) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");

  var results = this.nodes(obj, string)
    .map(function(r) { return r.value });

  return results;
};

JSONPath.prototype.paths = function(obj, string) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");

  var results = this.nodes(obj, string)
    .map(function(r) { return r.path });

  return results;
};

JSONPath.prototype.nodes = function(obj, string) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");

  var path = this.parser.parse(string);
  var handlers = this.handlers;

  var partials = [ { path: ['$'], value: obj } ];
  var matches = [];

  if (path.length && path[0].expression.type == 'root') path.shift();

  if (!path.length) return partials;

  path.forEach(function(component, index) {

    var handler = handlers.resolve(component);
    var _partials = [];

    partials.forEach(function(p) {
      var results = handler(component, p);

      if (index == path.length - 1) {
        // if we're through the components we're done
        matches = matches.concat(results || []);
      } else {
        // otherwise accumulate and carry on through
        _partials = _partials.concat(results || []);
      }
    });

    partials = _partials;

  });

  return matches;
};

JSONPath.prototype.stringify = function(path) {

  assert.ok(path, "we need a path");

  var string = '$';

  var templates = {
    'descendant-member': '..{{value}}',
    'child-member': '.{{value}}',
    'descendant-subscript': '..[{{value}}]',
    'child-subscript': '[{{value}}]'
  };

  path = this._normalize(path);

  path.forEach(function(component) {

    if (component.expression.type == 'root') return;

    var key = [component.scope, component.operation].join('-');
    var template = templates[key];
    var value;

    if (component.expression.type == 'string_literal') {
      value = JSON.stringify(component.expression.value)
    } else {
      value = component.expression.value;
    }

    if (!template) throw new Error("couldn't find template " + key);

    string += template.replace(/{{value}}/, value);
  });

  return string;
}

JSONPath.prototype._normalize = function(path) {

  assert.ok(path, "we need a path");

  if (typeof path == "string") {

    return this.parser.parse(path);

  } else if (Array.isArray(path) && typeof path[0] == "string") {

    var _path = [ { expression: { type: "root", value: "$" } } ];

    path.forEach(function(component, index) {

      if (component == '$' && index === 0) return;

      if (typeof component == "string" && component.match("^" + macros.identifier + "$")) {

        _path.push({
          operation: 'member',
          scope: 'child',
          expression: { value: component, type: 'identifier' }
        });

      } else {

        var type = typeof component == "number" ?
          'numeric_literal' : 'string_literal';

        _path.push({
          operation: 'subscript',
          scope: 'child',
          expression: { value: component, type: type }
        });
      }
    });

    return _path;

  } else if (Array.isArray(path) && typeof path[0] == "object") {

    return path
  }

  throw new Error("couldn't understand path " + path);
}

JSONPath.Handlers = Handlers;
JSONPath.Parser = Parser;

var instance = new JSONPath;
instance.JSONPath = JSONPath;

module.exports = instance;