/*
 * boolify-string
 * https://github.com/sanemat/node-boolify-string
 *
 * Copyright (c) 2014 sanemat
 * Licensed under the MIT license.
 */

'use strict';
var type = require('type-detect');

module.exports = function(obj){
  if (type(obj) !== 'string') {
    return !!obj;
  }
  var value = obj.toLowerCase();
  var bool;
  switch (value){
    case 'false':
    case '0':
    case 'undefined':
    case 'null':
    case '':
    case 'n':
    case 'no':
    case 'off':
      bool = false;
      break;
    default:
      bool = true;
      break;
  }
  return bool;
};
