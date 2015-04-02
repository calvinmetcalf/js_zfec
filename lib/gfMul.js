'use strict';
var constants = require('./constants');
module.exports = gfMul;

function gfMul(a, b) {
  return constants.GF_MUL_TABLE[a * 256 + b];
}
