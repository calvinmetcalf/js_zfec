/*
* modnn(x) computes x % GF_SIZE, where GF_SIZE is 2**GF_BITS - 1,
* without a slow divide.
*/
'use strict';
module.exports = modnn;
function modnn(x) {
  while (x >= 255) {
    x -= 255;
    x = (x >> 8) + (x & 255);
  }
  return x;
}
