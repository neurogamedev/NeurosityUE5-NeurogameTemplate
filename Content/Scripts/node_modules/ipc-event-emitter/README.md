# ipc-event-emitter

[![Build Status](https://secure.travis-ci.org/chocolateboy/ipc-event-emitter.svg)](http://travis-ci.org/chocolateboy/ipc-event-emitter)
[![NPM Version](http://img.shields.io/npm/v/ipc-event-emitter.svg)](https://www.npmjs.org/package/ipc-event-emitter)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [NAME](#name)
- [INSTALLATION](#installation)
- [USAGE](#usage)
    - [parent](#parent)
    - [child](#child)
    - [output](#output)
- [DESCRIPTION](#description)
- [EXPORTS](#exports)
  - [IPC (default)](#ipc-default)
    - [Options](#options)
  - [IPCEventEmitter](#ipceventemitter)
- [PROPERTIES](#properties)
  - [process](#process)
- [METHODS](#methods)
  - [emit](#emit)
  - [pin](#pin)
  - [unpin](#unpin)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# NAME

ipc-event-emitter - an EventEmitter wrapper for IPC between parent and child processes with support for states (AKA pinned events) and logging

# INSTALLATION

    $ npm install ipc-event-emitter

# USAGE

### parent

```javascript
import { fork } from 'child_process'
import IPC      from 'ipc-event-emitter'

let child = fork('./child.js')
let ipc = IPC(child)

ipc.on('ready', () => {
    console.log('got "ready", sending "ping"')
    ipc.emit('ping')
})

ipc.on('pong', () => {
    console.log('got "pong", disconnecting')
    child.disconnect()
})
```

### child

```javascript
import IPC from 'ipc-event-emitter'

let ipc = IPC(process)

ipc.on('ping', () => {
    console.log('got "ping", sending "pong"')
    ipc.emit('pong')
})

ipc.pin('ready')
```

### output

    got "ready", sending "ping"
    got "ping", sending "pong"
    got "pong", disconnecting

# DESCRIPTION

This module provides an [`EventEmitter`](https://nodejs.org/api/events.html) wrapper for child/parent processes which eliminates the need to use the [`child_process.send`](https://nodejs.org/api/child_process.html#child_process_child_send_message_sendhandle_options_callback) and [`process.send`](https://nodejs.org/api/process.html#process_process_send_message_sendhandle_options_callback) methods for [IPC](https://en.wikipedia.org/wiki/Inter-process_communication).

Instead, messages are sent to the connected process via the standard `emit` method. Exposing inter-process communication through the `EventEmitter` API makes it easy to pass the wrapper to code which expects a standard event emitter.

In addition, the wrapper extends the `EventEmitter` API to include support for states i.e. "sticky" events that can be subscribed to *after* they've fired. This ensures events are safely delivered regardless of when listeners are registered, and eliminates a common source of bugs and unpredictable behaviour when coordinating communicating processes.

# EXPORTS

## IPC (default)

```javascript
import IPC from 'ipc-event-emitter'

let ipc = IPC(process, { debug: true })

ipc.emit('start')
```

**Signature**: (process: [Process](https://nodejs.org/api/process.html) | [ChildProcess](https://nodejs.org/api/child_process.html), options?: object) → [IPCEventEmitter](#ipceventemitter)

Takes a process or child process and an optional options object and returns an event emitter which translates `emit` calls to the `send` protocol used for IPC between parent and child processes.

Events are fired remotely (i.e. in the IPC wrapper in the connected process) and listeners are registered locally i.e. in the IPC wrapper in the current process.

Otherwise, the wrapper has the same interface and the same behaviour as its base class, [`events.EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter), apart from the differences listed [below](#methods).

### Options

The following options are available:

<!-- use <h5> rather than ##### to (try to) unconfuse the markdown renderer on npmjs.com -->

* <h5>debug</h5>

    **Type**: boolean, default: `false`

    Enables event logging. Events are logged to the console. By default, the emitter is identified by the PID of its process, but this can be overridden via the [`name`](#name) option.

    Logging can also be enabled by setting the `IPC_EVENT_EMITTER_DEBUG` environment variable to a [true value](https://www.npmjs.com/package/boolify-string).

* <h5>name</h5>

    **Type**: string

    If logging is enabled, this value is used to identify the event emitter being logged. If not supplied, it defaults to the process's PID.

* <h5>timeout</h5>

    **Type**: positive integer

    If an IPC message takes longer than this number of milliseconds to deliver (Node.js < 4.0.0) or send (>= 4.0.0), the promise returned by [`emit`](#emit) or [`pin`](#pin) is rejected. The default value is `undefined` i.e. no time limit.

    Note that it's up to you to perform any cleanup (e.g. disconnecting the relevant process) if a message times out.

## IPCEventEmitter

```javascript
import { EventEmitter }         from 'events'
import IPC, { IPCEventEmitter } from 'ipc-event-emitter'

let ipc = IPC(fork('./child.js'))

assert(ipc instanceof IPCEventEmitter) // => true
assert(ipc instanceof EventEmitter)    // => true
```

The EventEmitter subclass the [IPC](#ipc-default) helper function returns instances of i.e.:

```javascript
import IPC from 'ipc-event-emitter'

let ipc = IPC(process, options)
```

is equivalent to:

```javascript
import { IPCEventEmitter } from 'ipc-event-emitter'

let ipc = new IPCEventEmitter(process, options)
```

# PROPERTIES

## process

```javascript
let ipc = IPC(fork('./child.js'))

ipc.on('complete', () => {
    ipc.process.disconnect()
})
```

**Type**: [Process](https://nodejs.org/api/process.html) | [ChildProcess](https://nodejs.org/api/child_process.html)

The process or child process supplied to the [`IPC`](#ipc-default) call.

# METHODS

## emit

```javascript
ipc.emit('start')

// or

ipc.emit('start').then(() => {
    console.log('emitted "start" event')
})
```

**Signature**: event: string, args: ...any → Promise

Emit an IPC event i.e. send a message from a parent process to a child process or vice versa. If arguments are supplied, they are passed to the registered listener(s). Arguments must be JSON-serializable as per `send`.

The return value is a promise. This is intended to provide a way to smooth over the differences between Node.js < v4.0.0, where `send` (and thus `emit` and `pin`) is synchronous, and Node.js >= v4.0.0, where it's asynchronous.

Note that on Node.js >= v4.0.0, the promise is resolved when the message has been *sent*, whereas on older versions it's resolved when the message has been *received*. As a result, only the former guarantee should be relied upon unless the target environment is known to be locked down to 0.x.

The value resolved by the promise is unspecified.

## pin

```javascript
ipc.pin('ready')

// or

ipc.pin('ready').then(() => {
    console.log('pinned "ready" event')
})
```

**Signature**: event: string, args: ...any → Promise

A "sticky" version of [`emit`](#emit). Listeners registered before this event occurs are notified in the same way as `emit`. Listeners registered after this event are called immediately with the supplied arguments.

Pinning an event makes it act like a state rather than a blink-and-you-miss-it notification. This is useful for states such as "ready" which are poorly modeled by events.

Note that the "error" event is special-cased by EventEmitter, and can't be pinned. Attempting to pin an event with this name will raise an error.

Returns a promise with the same behaviour as `emit`. As with `emit`, the value resolved by the promise is unspecified.

## unpin

```javascript
ipc.unpin('ready')

// or

ipc.unpin('ready').then(() => {
    console.log('unpinned "ready" event')
})
```

**Signature**: event: string → Promise

Unregister a "sticky" event. The behaviour prior to the pinning of the event is restored i.e. listeners registered after an event has been unpinned will only be invoked if the event occurs again in the future.

Returns a promise with the same behaviour as `emit`. As with `emit`, the value resolved by the promise is unspecified.

# SEE ALSO

* [fixed-event](https://www.npmjs.com/package/fixed-event)
* [ipcee](https://www.npmjs.com/package/ipcee)
* [ipc-emitter](https://www.npmjs.com/package/ipc-emitter)
* [ipc-events](https://www.npmjs.com/package/ipc-events)

# VERSION

2.0.2

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2015-2019 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](http://www.opensource.org/licenses/artistic-license-2.0.php).
