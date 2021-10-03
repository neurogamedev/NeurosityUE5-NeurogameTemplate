
# emit-logger

Event logger for EventEmitter.

## Installation

npm:

    $ npm install emit-logger

## Usage

Example:

```js
var Emitter = require('events').EventEmitter;
var EmitLogger = require('emit-logger');
var logger = new EmitLogger();

var emitter1 = new Emitter();
var emitter2 = new Emitter();

logger.add(emitter1, { name: 'emitter1' });
logger.add(emitter2, { name: 'emitter2' });

emitter1.on('foo', function() {
  console.log('foo!');
});

emitter1.emit('foo', 'hello', 'world');

setInterval(function() {
  emitter2.emit('random', Math.random());
}, 500);
```

![screenshot](http://i.cloudup.com/5P1-B0YT9o.png)

## License

The MIT License

Copyright (c) 2013 Circuit Lab. &lt;info@uniba.jp&gt;
