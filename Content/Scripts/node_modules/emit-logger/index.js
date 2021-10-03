
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var Store = require('./lib/store');

/**
 * Expose `EmitLogger`. 
 */

module.exports = EmitLogger;

/**
 * Expose `Store`.
 */

EmitLogger.Store = Store;

/**
 * @params {Store} store
 */

function EmitLogger(store) {
  this._emitters = [];
  this._store = store || new Store();
}

/**
 * Inherits from `EventEmitter`
 */

EmitLogger.prototype.__proto__ = Emitter.prototype;

/**
 * @param {EventEmitter} emitter
 */

EmitLogger.prototype.add = function(emitter, _options) {
  var options = _options || {};
  var self = this;
  var emit = emitter.emit;

  if ('function' !== typeof emit) {
    throw new TypeError('EventEmitter instance required.');
  }

  emitter.emit = function() {
    var args = [].slice.call(arguments);
    self._store.add(emitter, args, options);
    return emit.apply(emitter, arguments);
  };

  this.on('remove', onremove);

  function onremove(removedEmitter) {
    if (emitter !== removedEmitter) return;
    removedEmitter.emit = emit;
    self.removeListener('remove', onremove);
  }
  
  this._emitters.push(emitter);
  this.emit('add', emitter);
  
  return this;
};

/**
 * @param {EventEmitter} emitter
 */

EmitLogger.prototype.remove = function(emitter) {
  var previous = this._emitters.length;
  
  this._emitters = this._emitters.filter(function(e) {
    return e !== emitter;
  });
  
  if (previous !== this._emitters.length) {
    this.emit('remove', emitter);
  }

  return this;
};
