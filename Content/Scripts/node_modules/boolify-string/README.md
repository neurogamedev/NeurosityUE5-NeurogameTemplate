# boolify-string
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Appveyor Status][appveyor-image]][appveyor-url] [![Dependency Status][daviddm-url]][daviddm-image]

> Check a string whether truthy or falsy.


## Use case
  Read from environment variable, sometimes these are 'True', 'false', '1', '', undefined, etc.

```javascript
if (boolifyString(process.env.CI)){
  something_do();
}
```

## Install

```bash
$ npm install --save boolify-string
```


## Usage

```javascript
var boolifyString = require('boolify-string');

boolifyString('true');// #=> true
boolifyString('TRUE');// #=> true
boolifyString('True');// #=> true
boolifyString('false');// #=> false

boolifyString('{}');// #=> true
boolifyString('foo');// #=> true
boolifyString('');// #=> false
boolifyString('1');// #=> true
boolifyString('-1');// #=> true
boolifyString('0');// #=> false
boolifyString('[]');// #=> true
boolifyString('undefined');// #=> false
boolifyString('null');// #=> false

// primitive values as is
boolifyString(true);// #=> true
boolifyString(false);// #=> false
boolifyString({});// #=> true
boolifyString(1);// #=> true
boolifyString(-1);// #=> true
boolifyString(0);// #=> false
boolifyString([]);// #=> true
boolifyString(undefined);// #=> false
boolifyString(null);// #=> false

// string constructor
boolifyString(new String('true'));// #=> true
boolifyString(new String('false'));// #=> false

// YAML's specification
// http://yaml.org/type/bool.html
// y|Y|yes|Yes|YES|n|N|no|No|NO
// |true|True|TRUE|false|False|FALSE
// |on|On|ON|off|Off|OFF
boolifyString('y');// #=> true
boolifyString('Y');// #=> true
boolifyString('yes');// #=> true
boolifyString('Yes');// #=> true
boolifyString('YES');// #=> true
boolifyString('n');// #=> false
boolifyString('N');// #=> false
boolifyString('no');// #=> false
boolifyString('No');// #=> false
boolifyString('NO');// #=> false
boolifyString('true');// #=> true
boolifyString('True');// #=> true
boolifyString('TRUE');// #=> true
boolifyString('false');// #=> false
boolifyString('False');// #=> false
boolifyString('FALSE');// #=> false
boolifyString('on');// #=> true
boolifyString('On');// #=> true
boolifyString('ON');// #=> true
boolifyString('off');// #=> false
boolifyString('Off');// #=> false
boolifyString('OFF');// #=> false
```


## Simular

* [yn](https://github.com/sindresorhus/yn)


## Changelog

[changelog](./changelog.md)


## License

Copyright (c) 2014-2015 sanemat. Licensed under the MIT license.


[npm-url]: https://npmjs.org/package/boolify-string
[npm-image]: https://badge.fury.io/js/boolify-string.svg
[travis-url]: https://travis-ci.org/sanemat/node-boolify-string
[travis-image]: https://travis-ci.org/sanemat/node-boolify-string.svg?branch=master
[daviddm-url]: https://david-dm.org/sanemat/node-boolify-string.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/sanemat/node-boolify-string
[appveyor-url]: https://ci.appveyor.com/project/sanemat/node-boolify-string/branch/master
[appveyor-image]: https://img.shields.io/appveyor/ci/sanemat/node-boolify-string/master.svg?style=flat-square&label=appveyor
