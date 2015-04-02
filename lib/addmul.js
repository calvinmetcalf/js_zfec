
'use strict';
/*
* addmul() computes dst[] = dst[] + c * src[]
* This is used often, so better optimize it! Currently the loop is
* unrolled 16 times, a good value for 486 and pentium-class machines.
* The case c=0 is also optimized, whereas c=1 is not. These
* calls are unfrequent in my typical apps so I did not bother.
*/
var gfMul = require('./gfMul');
module.exports = addmul;
function addmul(dst, dstIdx, src, srcIdx, c, sz) {
  var i;
  if (c !== 0) {
    for (i = 0; i < sz; i++) {
      dst[dstIdx + i] ^= gfMul(src[srcIdx + i], c);
    }
  }
}
