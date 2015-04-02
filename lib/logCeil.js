'use strict';

module.exports = logCeil;

function logCeil(n, b) {
  /*
  The smallest integer k such that b^k >= n.
  */
  var p = 1;
  var k = 0;
  while (p < n) {
    p *= b;
    k += 1;
  }
  return k;
}
