'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IPCEventEmitter = undefined;

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

exports.default = IPC;

require('source-map-support/register');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _boolifyString = require('boolify-string');

var _boolifyString2 = _interopRequireDefault(_boolifyString);

var _events = require('events');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEBUG = (0, _boolifyString2.default)(process.env.IPC_EVENT_EMITTER_DEBUG);
var NODE_GE_4 = _semver2.default.gte(process.version, '4.0.0');
var OPTIONS = { debug: DEBUG };
var SEND_OR_DELIVER = NODE_GE_4 ? 'send' : 'deliver';
var TYPE = 'ipc-event-emitter';

function isIPCProcess($process) {
    return _lodash2.default.isFunction($process.send) && _lodash2.default.isFunction($process.on);
}

var IPCEventEmitter = exports.IPCEventEmitter = function (_EventEmitter) {
    (0, _inherits3.default)(IPCEventEmitter, _EventEmitter);

    function IPCEventEmitter($process) {
        var $options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        (0, _classCallCheck3.default)(this, IPCEventEmitter);

        var _this = (0, _possibleConstructorReturn3.default)(this, (IPCEventEmitter.__proto__ || (0, _getPrototypeOf2.default)(IPCEventEmitter)).call(this));

        _this._pinned = {};

        if (isIPCProcess($process)) {
            _this.process = $process;
        } else {
            throw new TypeError('Invalid process; expected Process|ChildProcess, got: ' + $process);
        }

        var timeout = $options.timeout;

        if (timeout) {
            if (_lodash2.default.isNumber(timeout) && timeout > 0) {
                _this._timeout = timeout;
            } else {
                throw new TypeError('Invalid timeout; expected number > 0, got: ' + timeout);
            }
        }

        // register the listener for our IPC messages.
        // we distinguish our messages by the presence
        // of a `type` field with a value of TYPE (defined
        // above) e.g. { type: "ipc-event-emitter" }.
        // our messages come in the following flavours:
        //
        // unpin e.g. { unpin: 'ready' }
        //
        //     remove the named event from the target's
        //     `pinned` event object.
        //
        // pin e.g. { pin: true, emit: [ 'ready' ] }
        //
        //     add the event and its arguments to the target's
        //     `pinned` event object and fire the event in
        //     the target
        //
        // emit e.g. { emit: [ 'downloaded', 'http://example.com/file.txt' ] }
        //
        //     emit the specified event (e.g. `downloaded`) in the target
        $process.on('message', function (data) {
            if (data && data.type === TYPE) {
                if (data.unpin) {
                    delete _this._pinned[data.unpin];
                } else {
                    // XXX make sure we pin before we emit
                    // in case e.g. listener 1 registers
                    // listener 2 for this event while listener
                    // 1 is running (TODO test this).
                    if (data.pin) {
                        var _data$emit = (0, _toArray3.default)(data.emit),
                            name = _data$emit[0],
                            args = _data$emit.slice(1);

                        _this._pinned[name] = args;
                    }

                    (0, _get3.default)(IPCEventEmitter.prototype.__proto__ || (0, _getPrototypeOf2.default)(IPCEventEmitter.prototype), 'emit', _this).apply(_this, data.emit);
                }
            }
        });

        var options = _lodash2.default.assign({}, OPTIONS, $options);

        if (options.debug) {
            var EmitLogger = require('emit-logger');
            var name = options.name || $process.pid;
            var logger = new EmitLogger();

            logger.add($process, { name: name });
        }
        return _this;
    }

    // emit an event in the same way as `EventEmitter.emit`,
    // but emit it in the process at the other end of the IPC channel


    (0, _createClass3.default)(IPCEventEmitter, [{
        key: 'emit',
        value: function emit() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return this._sendAsync({ emit: args });
        }

        // register a sticky event
        //
        // a) emit the event in the IPC wrapper in the
        // target process (i.e. the child/parent process
        // at the other end of the IPC channel)
        //
        // b) the message handler in the target process
        // adds the event name (string) => arguments (array)
        // pair to its local map of pinned events

    }, {
        key: 'pin',
        value: function pin(name) {
            if (name === 'error') {
                throw new TypeError('"error" events cannot be pinned');
            }

            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            return this._sendAsync({ emit: [name].concat(args), pin: true });
        }

        // unregister a sticky event

    }, {
        key: 'unpin',
        value: function unpin(name) {
            return this._sendAsync({ unpin: name });
        }

        // append a new listener for this event

    }, {
        key: 'addListener',
        value: function addListener(name, listener) {
            (0, _get3.default)(IPCEventEmitter.prototype.__proto__ || (0, _getPrototypeOf2.default)(IPCEventEmitter.prototype), 'addListener', this).call(this, name, listener);
            return this._invokeIfPinned(name, listener);
        }

        // prepend a new listener for this event

    }, {
        key: 'prependListener',
        value: function prependListener(name, listener) {
            (0, _get3.default)(IPCEventEmitter.prototype.__proto__ || (0, _getPrototypeOf2.default)(IPCEventEmitter.prototype), 'prependListener', this).call(this, name, listener);
            return this._invokeIfPinned(name, listener);
        }

        // append a new listener for this event.
        // in theory, this should behave the same as
        // `addListener`. in practice, the two methods
        // may (for some reason) be implemented separately,
        // so rather than assuming or hoping, we just
        // delegate to the specified method

    }, {
        key: 'on',
        value: function on(name, listener) {
            (0, _get3.default)(IPCEventEmitter.prototype.__proto__ || (0, _getPrototypeOf2.default)(IPCEventEmitter.prototype), 'on', this).call(this, name, listener);
            return this._invokeIfPinned(name, listener);
        }

        // append a new one-time listener for this event

    }, {
        key: 'once',
        value: function once(name, listener) {
            return this._invokeIfPinned(name, listener, 'once');
        }

        // prepend a new one-time listener for this event

    }, {
        key: 'prependOnceListener',
        value: function prependOnceListener(name, listener) {
            return this._invokeIfPinned(name, listener, 'prependOnceListener');
        }

        // immediately fire a listener registered
        // with `on`, `addListener` &c. if its event
        // has been pinned.
        //
        // in most cases, the listener will already have
        // been registered before this method is called,
        // but for one-shot listeners (`once` and
        // `prependOnceListener`) we either a) fire them once
        // and forget them if the event is pinned (i.e. no
        // need to register them) or b) register them as usual
        // with super.once(...) or super.prependOnceListener(...)
        // if the event isn't pinned.
        //
        // to support the latter case, the name of the method
        // to delegate to is passed as the third parameter.

    }, {
        key: '_invokeIfPinned',
        value: function _invokeIfPinned(name, listener, delegate) {
            var pinned = this._pinned[name];

            if (pinned) {
                listener.apply(this, pinned);
            } else if (delegate) {
                // e.g. super.once(name, listener)
                (0, _get3.default)(IPCEventEmitter.prototype.__proto__ || (0, _getPrototypeOf2.default)(IPCEventEmitter.prototype), delegate, this).call(this, name, listener);
            }

            return this;
        }

        // use Node's underlying IPC protocol to send a
        // message between a parent process and a child
        // process
        //
        // # child.js
        // process.send(message) // child -> parent
        //
        // # parent.js
        // child = child_process.fork("child.js")
        // child.send(message)   // parent -> child

    }, {
        key: '_sendAsync',
        value: function _sendAsync(message) {
            var _this2 = this;

            var promise = void 0;

            // it's safe to mutate this message object as it's
            // always constructed internally
            message.type = TYPE;

            if (NODE_GE_4) {
                promise = _bluebird2.default.fromNode(function (callback) {
                    _this2.process.send(message, callback);
                });
            } else {
                promise = new _bluebird2.default(function (resolve, reject) {
                    process.nextTick(function () {
                        try {
                            resolve(_this2.process.send(message));
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
            }

            var timeout = this._timeout;

            if (timeout) {
                return promise.timeout(timeout, 'IPC message took > ' + timeout + ' ms to ' + SEND_OR_DELIVER);
            } else {
                return promise;
            }
        }
    }]);
    return IPCEventEmitter;
}(_events.EventEmitter);

function IPC($process) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return new IPCEventEmitter($process, options);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9pcGMtZXZlbnQtZW1pdHRlci5qcyJdLCJuYW1lcyI6WyJJUEMiLCJERUJVRyIsInByb2Nlc3MiLCJlbnYiLCJJUENfRVZFTlRfRU1JVFRFUl9ERUJVRyIsIk5PREVfR0VfNCIsInNlbXZlciIsImd0ZSIsInZlcnNpb24iLCJPUFRJT05TIiwiZGVidWciLCJTRU5EX09SX0RFTElWRVIiLCJUWVBFIiwiaXNJUENQcm9jZXNzIiwiJHByb2Nlc3MiLCJfIiwiaXNGdW5jdGlvbiIsInNlbmQiLCJvbiIsIklQQ0V2ZW50RW1pdHRlciIsIiRvcHRpb25zIiwiX3Bpbm5lZCIsIlR5cGVFcnJvciIsInRpbWVvdXQiLCJpc051bWJlciIsIl90aW1lb3V0IiwiZGF0YSIsInR5cGUiLCJ1bnBpbiIsInBpbiIsImVtaXQiLCJuYW1lIiwiYXJncyIsImFwcGx5Iiwib3B0aW9ucyIsImFzc2lnbiIsIkVtaXRMb2dnZXIiLCJyZXF1aXJlIiwicGlkIiwibG9nZ2VyIiwiYWRkIiwiX3NlbmRBc3luYyIsImxpc3RlbmVyIiwiX2ludm9rZUlmUGlubmVkIiwiZGVsZWdhdGUiLCJwaW5uZWQiLCJtZXNzYWdlIiwicHJvbWlzZSIsIlByb21pc2UiLCJmcm9tTm9kZSIsImNhbGxiYWNrIiwicmVzb2x2ZSIsInJlamVjdCIsIm5leHRUaWNrIiwiZSIsIkV2ZW50RW1pdHRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBb093QkEsRzs7QUFwT3hCOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQyxRQUFrQiw2QkFBU0MsUUFBUUMsR0FBUixDQUFZQyx1QkFBckIsQ0FBeEI7QUFDQSxJQUFNQyxZQUFrQkMsaUJBQU9DLEdBQVAsQ0FBV0wsUUFBUU0sT0FBbkIsRUFBNEIsT0FBNUIsQ0FBeEI7QUFDQSxJQUFNQyxVQUFrQixFQUFFQyxPQUFPVCxLQUFULEVBQXhCO0FBQ0EsSUFBTVUsa0JB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RUFBOEJvQixPQUE5QixDQUFQO0FBQ0giLCJmaWxlIjoic3JjL2lwYy1ldmVudC1lbWl0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInXG5pbXBvcnQgUHJvbWlzZSAgICAgICAgICBmcm9tICdibHVlYmlyZCdcbmltcG9ydCBzdHIyYm9vbCAgICAgICAgIGZyb20gJ2Jvb2xpZnktc3RyaW5nJ1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IF8gICAgICAgICAgICAgICAgZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IHNlbXZlciAgICAgICAgICAgZnJvbSAnc2VtdmVyJ1xuXG5jb25zdCBERUJVRyAgICAgICAgICAgPSBzdHIyYm9vbChwcm9jZXNzLmVudi5JUENfRVZFTlRfRU1JVFRFUl9ERUJVRylcbmNvbnN0IE5PREVfR0VfNCAgICAgICA9IHNlbXZlci5ndGUocHJvY2Vzcy52ZXJzaW9uLCAnNC4wLjAnKVxuY29uc3QgT1BUSU9OUyAgICAgICAgID0geyBkZWJ1ZzogREVCVUcgfVxuY29uc3QgU0VORF9PUl9ERUxJVkVSID0gTk9ERV9HRV80ID8gJ3NlbmQnIDogJ2RlbGl2ZXInXG5jb25zdCBUWVBFICAgICAgICAgICAgPSAnaXBjLWV2ZW50LWVtaXR0ZXInXG5cbmZ1bmN0aW9uIGlzSVBDUHJvY2VzcyAoJHByb2Nlc3MpIHtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKCRwcm9jZXNzLnNlbmQpICYmIF8uaXNGdW5jdGlvbigkcHJvY2Vzcy5vbilcbn1cblxuZXhwb3J0IGNsYXNzIElQQ0V2ZW50RW1pdHRlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IgKCRwcm9jZXNzLCAkb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKClcblxuICAgICAgICB0aGlzLl9waW5uZWQgPSB7fVxuXG4gICAgICAgIGlmIChpc0lQQ1Byb2Nlc3MoJHByb2Nlc3MpKSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3MgPSAkcHJvY2Vzc1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgICBgSW52YWxpZCBwcm9jZXNzOyBleHBlY3RlZCBQcm9jZXNzfENoaWxkUHJvY2VzcywgZ290OiAkeyRwcm9jZXNzfWAsXG4gICAgICAgICAgICApXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGltZW91dCA9ICRvcHRpb25zLnRpbWVvdXRcblxuICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgICAgaWYgKF8uaXNOdW1iZXIodGltZW91dCkgJiYgdGltZW91dCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aW1lb3V0ID0gdGltZW91dFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgSW52YWxpZCB0aW1lb3V0OyBleHBlY3RlZCBudW1iZXIgPiAwLCBnb3Q6ICR7dGltZW91dH1gLFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlZ2lzdGVyIHRoZSBsaXN0ZW5lciBmb3Igb3VyIElQQyBtZXNzYWdlcy5cbiAgICAgICAgLy8gd2UgZGlzdGluZ3Vpc2ggb3VyIG1lc3NhZ2VzIGJ5IHRoZSBwcmVzZW5jZVxuICAgICAgICAvLyBvZiBhIGB0eXBlYCBmaWVsZCB3aXRoIGEgdmFsdWUgb2YgVFlQRSAoZGVmaW5lZFxuICAgICAgICAvLyBhYm92ZSkgZS5nLiB7IHR5cGU6IFwiaXBjLWV2ZW50LWVtaXR0ZXJcIiB9LlxuICAgICAgICAvLyBvdXIgbWVzc2FnZXMgY29tZSBpbiB0aGUgZm9sbG93aW5nIGZsYXZvdXJzOlxuICAgICAgICAvL1xuICAgICAgICAvLyB1bnBpbiBlLmcuIHsgdW5waW46ICdyZWFkeScgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgcmVtb3ZlIHRoZSBuYW1lZCBldmVudCBmcm9tIHRoZSB0YXJnZXQnc1xuICAgICAgICAvLyAgICAgYHBpbm5lZGAgZXZlbnQgb2JqZWN0LlxuICAgICAgICAvL1xuICAgICAgICAvLyBwaW4gZS5nLiB7IHBpbjogdHJ1ZSwgZW1pdDogWyAncmVhZHknIF0gfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgYWRkIHRoZSBldmVudCBhbmQgaXRzIGFyZ3VtZW50cyB0byB0aGUgdGFyZ2V0J3NcbiAgICAgICAgLy8gICAgIGBwaW5uZWRgIGV2ZW50IG9iamVjdCBhbmQgZmlyZSB0aGUgZXZlbnQgaW5cbiAgICAgICAgLy8gICAgIHRoZSB0YXJnZXRcbiAgICAgICAgLy9cbiAgICAgICAgLy8gZW1pdCBlLmcuIHsgZW1pdDogWyAnZG93bmxvYWRlZCcsICdodHRwOi8vZXhhbXBsZS5jb20vZmlsZS50eHQnIF0gfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgZW1pdCB0aGUgc3BlY2lmaWVkIGV2ZW50IChlLmcuIGBkb3dubG9hZGVkYCkgaW4gdGhlIHRhcmdldFxuICAgICAgICAkcHJvY2Vzcy5vbignbWVzc2FnZScsIGRhdGEgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS50eXBlID09PSBUWVBFKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEudW5waW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3Bpbm5lZFtkYXRhLnVucGluXVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFhYWCBtYWtlIHN1cmUgd2UgcGluIGJlZm9yZSB3ZSBlbWl0XG4gICAgICAgICAgICAgICAgICAgIC8vIGluIGNhc2UgZS5nLiBsaXN0ZW5lciAxIHJlZ2lzdGVyc1xuICAgICAgICAgICAgICAgICAgICAvLyBsaXN0ZW5lciAyIGZvciB0aGlzIGV2ZW50IHdoaWxlIGxpc3RlbmVyXG4gICAgICAgICAgICAgICAgICAgIC8vIDEgaXMgcnVubmluZyAoVE9ETyB0ZXN0IHRoaXMpLlxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5waW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbIG5hbWUsIC4uLmFyZ3MgXSA9IGRhdGEuZW1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGlubmVkW25hbWVdID0gYXJnc1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuZW1pdC5hcHBseSh0aGlzLCBkYXRhLmVtaXQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIGxldCBvcHRpb25zID0gXy5hc3NpZ24oe30sIE9QVElPTlMsICRvcHRpb25zKVxuXG4gICAgICAgIGlmIChvcHRpb25zLmRlYnVnKSB7XG4gICAgICAgICAgICBsZXQgRW1pdExvZ2dlciA9IHJlcXVpcmUoJ2VtaXQtbG9nZ2VyJylcbiAgICAgICAgICAgIGxldCBuYW1lID0gb3B0aW9ucy5uYW1lIHx8ICRwcm9jZXNzLnBpZFxuICAgICAgICAgICAgbGV0IGxvZ2dlciA9IG5ldyBFbWl0TG9nZ2VyKClcblxuICAgICAgICAgICAgbG9nZ2VyLmFkZCgkcHJvY2VzcywgeyBuYW1lIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBlbWl0IGFuIGV2ZW50IGluIHRoZSBzYW1lIHdheSBhcyBgRXZlbnRFbWl0dGVyLmVtaXRgLFxuICAgIC8vIGJ1dCBlbWl0IGl0IGluIHRoZSBwcm9jZXNzIGF0IHRoZSBvdGhlciBlbmQgb2YgdGhlIElQQyBjaGFubmVsXG4gICAgZW1pdCAoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZEFzeW5jKHsgZW1pdDogYXJncyB9KVxuICAgIH1cblxuICAgIC8vIHJlZ2lzdGVyIGEgc3RpY2t5IGV2ZW50XG4gICAgLy9cbiAgICAvLyBhKSBlbWl0IHRoZSBldmVudCBpbiB0aGUgSVBDIHdyYXBwZXIgaW4gdGhlXG4gICAgLy8gdGFyZ2V0IHByb2Nlc3MgKGkuZS4gdGhlIGNoaWxkL3BhcmVudCBwcm9jZXNzXG4gICAgLy8gYXQgdGhlIG90aGVyIGVuZCBvZiB0aGUgSVBDIGNoYW5uZWwpXG4gICAgLy9cbiAgICAvLyBiKSB0aGUgbWVzc2FnZSBoYW5kbGVyIGluIHRoZSB0YXJnZXQgcHJvY2Vzc1xuICAgIC8vIGFkZHMgdGhlIGV2ZW50IG5hbWUgKHN0cmluZykgPT4gYXJndW1lbnRzIChhcnJheSlcbiAgICAvLyBwYWlyIHRvIGl0cyBsb2NhbCBtYXAgb2YgcGlubmVkIGV2ZW50c1xuICAgIHBpbiAobmFtZSwgLi4uYXJncykge1xuICAgICAgICBpZiAobmFtZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJlcnJvclwiIGV2ZW50cyBjYW5ub3QgYmUgcGlubmVkJylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kQXN5bmMoeyBlbWl0OiBbIG5hbWUsIC4uLmFyZ3MgXSwgcGluOiB0cnVlIH0pXG4gICAgfVxuXG4gICAgLy8gdW5yZWdpc3RlciBhIHN0aWNreSBldmVudFxuICAgIHVucGluIChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kQXN5bmMoeyB1bnBpbjogbmFtZSB9KVxuICAgIH1cblxuICAgIC8vIGFwcGVuZCBhIG5ldyBsaXN0ZW5lciBmb3IgdGhpcyBldmVudFxuICAgIGFkZExpc3RlbmVyIChuYW1lLCBsaXN0ZW5lcikge1xuICAgICAgICBzdXBlci5hZGRMaXN0ZW5lcihuYW1lLCBsaXN0ZW5lcilcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZUlmUGlubmVkKG5hbWUsIGxpc3RlbmVyKVxuICAgIH1cblxuICAgIC8vIHByZXBlbmQgYSBuZXcgbGlzdGVuZXIgZm9yIHRoaXMgZXZlbnRcbiAgICBwcmVwZW5kTGlzdGVuZXIgKG5hbWUsIGxpc3RlbmVyKSB7XG4gICAgICAgIHN1cGVyLnByZXBlbmRMaXN0ZW5lcihuYW1lLCBsaXN0ZW5lcilcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZUlmUGlubmVkKG5hbWUsIGxpc3RlbmVyKVxuICAgIH1cblxuICAgIC8vIGFwcGVuZCBhIG5ldyBsaXN0ZW5lciBmb3IgdGhpcyBldmVudC5cbiAgICAvLyBpbiB0aGVvcnksIHRoaXMgc2hvdWxkIGJlaGF2ZSB0aGUgc2FtZSBhc1xuICAgIC8vIGBhZGRMaXN0ZW5lcmAuIGluIHByYWN0aWNlLCB0aGUgdHdvIG1ldGhvZHNcbiAgICAvLyBtYXkgKGZvciBzb21lIHJlYXNvbikgYmUgaW1wbGVtZW50ZWQgc2VwYXJhdGVseSxcbiAgICAvLyBzbyByYXRoZXIgdGhhbiBhc3N1bWluZyBvciBob3BpbmcsIHdlIGp1c3RcbiAgICAvLyBkZWxlZ2F0ZSB0byB0aGUgc3BlY2lmaWVkIG1ldGhvZFxuICAgIG9uIChuYW1lLCBsaXN0ZW5lcikge1xuICAgICAgICBzdXBlci5vbihuYW1lLCBsaXN0ZW5lcilcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZUlmUGlubmVkKG5hbWUsIGxpc3RlbmVyKVxuICAgIH1cblxuICAgIC8vIGFwcGVuZCBhIG5ldyBvbmUtdGltZSBsaXN0ZW5lciBmb3IgdGhpcyBldmVudFxuICAgIG9uY2UgKG5hbWUsIGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2VJZlBpbm5lZChuYW1lLCBsaXN0ZW5lciwgJ29uY2UnKVxuICAgIH1cblxuICAgIC8vIHByZXBlbmQgYSBuZXcgb25lLXRpbWUgbGlzdGVuZXIgZm9yIHRoaXMgZXZlbnRcbiAgICBwcmVwZW5kT25jZUxpc3RlbmVyIChuYW1lLCBsaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlSWZQaW5uZWQobmFtZSwgbGlzdGVuZXIsICdwcmVwZW5kT25jZUxpc3RlbmVyJylcbiAgICB9XG5cbiAgICAvLyBpbW1lZGlhdGVseSBmaXJlIGEgbGlzdGVuZXIgcmVnaXN0ZXJlZFxuICAgIC8vIHdpdGggYG9uYCwgYGFkZExpc3RlbmVyYCAmYy4gaWYgaXRzIGV2ZW50XG4gICAgLy8gaGFzIGJlZW4gcGlubmVkLlxuICAgIC8vXG4gICAgLy8gaW4gbW9zdCBjYXNlcywgdGhlIGxpc3RlbmVyIHdpbGwgYWxyZWFkeSBoYXZlXG4gICAgLy8gYmVlbiByZWdpc3RlcmVkIGJlZm9yZSB0aGlzIG1ldGhvZCBpcyBjYWxsZWQsXG4gICAgLy8gYnV0IGZvciBvbmUtc2hvdCBsaXN0ZW5lcnMgKGBvbmNlYCBhbmRcbiAgICAvLyBgcHJlcGVuZE9uY2VMaXN0ZW5lcmApIHdlIGVpdGhlciBhKSBmaXJlIHRoZW0gb25jZVxuICAgIC8vIGFuZCBmb3JnZXQgdGhlbSBpZiB0aGUgZXZlbnQgaXMgcGlubmVkIChpLmUuIG5vXG4gICAgLy8gbmVlZCB0byByZWdpc3RlciB0aGVtKSBvciBiKSByZWdpc3RlciB0aGVtIGFzIHVzdWFsXG4gICAgLy8gd2l0aCBzdXBlci5vbmNlKC4uLikgb3Igc3VwZXIucHJlcGVuZE9uY2VMaXN0ZW5lciguLi4pXG4gICAgLy8gaWYgdGhlIGV2ZW50IGlzbid0IHBpbm5lZC5cbiAgICAvL1xuICAgIC8vIHRvIHN1cHBvcnQgdGhlIGxhdHRlciBjYXNlLCB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kXG4gICAgLy8gdG8gZGVsZWdhdGUgdG8gaXMgcGFzc2VkIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXIuXG4gICAgX2ludm9rZUlmUGlubmVkIChuYW1lLCBsaXN0ZW5lciwgZGVsZWdhdGUpIHtcbiAgICAgICAgbGV0IHBpbm5lZCA9IHRoaXMuX3Bpbm5lZFtuYW1lXVxuXG4gICAgICAgIGlmIChwaW5uZWQpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIHBpbm5lZClcbiAgICAgICAgfSBlbHNlIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgICAgLy8gZS5nLiBzdXBlci5vbmNlKG5hbWUsIGxpc3RlbmVyKVxuICAgICAgICAgICAgc3VwZXJbZGVsZWdhdGVdKG5hbWUsIGxpc3RlbmVyKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICAvLyB1c2UgTm9kZSdzIHVuZGVybHlpbmcgSVBDIHByb3RvY29sIHRvIHNlbmQgYVxuICAgIC8vIG1lc3NhZ2UgYmV0d2VlbiBhIHBhcmVudCBwcm9jZXNzIGFuZCBhIGNoaWxkXG4gICAgLy8gcHJvY2Vzc1xuICAgIC8vXG4gICAgLy8gIyBjaGlsZC5qc1xuICAgIC8vIHByb2Nlc3Muc2VuZChtZXNzYWdlKSAvLyBjaGlsZCAtPiBwYXJlbnRcbiAgICAvL1xuICAgIC8vICMgcGFyZW50LmpzXG4gICAgLy8gY2hpbGQgPSBjaGlsZF9wcm9jZXNzLmZvcmsoXCJjaGlsZC5qc1wiKVxuICAgIC8vIGNoaWxkLnNlbmQobWVzc2FnZSkgICAvLyBwYXJlbnQgLT4gY2hpbGRcbiAgICBfc2VuZEFzeW5jIChtZXNzYWdlKSB7XG4gICAgICAgIGxldCBwcm9taXNlXG5cbiAgICAgICAgLy8gaXQncyBzYWZlIHRvIG11dGF0ZSB0aGlzIG1lc3NhZ2Ugb2JqZWN0IGFzIGl0J3NcbiAgICAgICAgLy8gYWx3YXlzIGNvbnN0cnVjdGVkIGludGVybmFsbHlcbiAgICAgICAgbWVzc2FnZS50eXBlID0gVFlQRVxuXG4gICAgICAgIGlmIChOT0RFX0dFXzQpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBQcm9taXNlLmZyb21Ob2RlKGNhbGxiYWNrID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3Muc2VuZChtZXNzYWdlLCBjYWxsYmFjaylcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnByb2Nlc3Muc2VuZChtZXNzYWdlKSlcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0aW1lb3V0ID0gdGhpcy5fdGltZW91dFxuXG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aW1lb3V0KFxuICAgICAgICAgICAgICAgIHRpbWVvdXQsXG4gICAgICAgICAgICAgICAgYElQQyBtZXNzYWdlIHRvb2sgPiAke3RpbWVvdXR9IG1zIHRvICR7U0VORF9PUl9ERUxJVkVSfWBcbiAgICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIElQQyAoJHByb2Nlc3MsIG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgSVBDRXZlbnRFbWl0dGVyKCRwcm9jZXNzLCBvcHRpb25zKVxufVxuIl19