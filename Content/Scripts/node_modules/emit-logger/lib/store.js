/**
 * Module dependencies.
 */

var chalk = require('chalk');
var inspect = require('util').inspect;
var moment = require('moment');

/**
 * Expose `Store`.
 */

module.exports = Store;

/**
 * @param {Object} options
 */

function Store(options) {
  this.options = options || {};
}

/**
 * @param {EventEmitter} emitter
 * @param {Array} args
 */

Store.prototype.add = function(emitter, args, _options) {
  var options = _options || {};

  console.log(
    '%s %s %s emitting %s:',
    chalk.gray('[emit-logger]'),
    chalk.gray(moment().format('HH:mm:ss.SSS')),
    chalk.cyan(options.name || emitter),
    chalk.green(args.shift()),
    inspect(args, { colors: true })
  );

  return this;
};
