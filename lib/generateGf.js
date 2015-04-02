'use strict';

/*
* Primitive polynomials - see Lin & Costello, Appendix A,
* and  Lee & Messerschmitt, p. 453.
*/

module.exports = generateGf;
var constants = require('./constants');
var Pp = '101110001';

function generateGf() {
  var i;
  var mask;

  mask = 1;                     /* x ** 0 = 1 */
  constants.GF_EXP[8] = 0;          /* will be updated at the end of the 1st loop */
  /*
  * first, generate the (polynomial representation of) powers of \alpha,
  * which are stored in GF_EXP[i] = \alpha ** i .
  * At the same time build GF_LOG[GF_EXP[i]] = i .
  * The first 8 powers are simply bits shifted to the left.
  */
  for (i = 0; i < 8; i++, mask <<= 1) {
    constants.GF_EXP[i] = mask;
    constants.GF_LOG[constants.GF_EXP[i]] = i;
    /*
    * If Pp[i] == 1 then \alpha ** i occurs in poly-repr
    * GF_EXP[8] = \alpha ** 8
    */
    if (Pp.charAt(i) === '1') {
      constants.GF_EXP[8] ^= mask;
    }
  }
  /*
  * now GF_EXP[8] = \alpha ** 8 is complete, so can also
  * compute its INVERSE.
  */
  constants.GF_LOG[constants.GF_EXP[8]] = 8;
    /*
    * Poly-repr of \alpha ** (i+1) is given by poly-repr of
    * \alpha ** i shifted left one-bit and accounting for any
    * \alpha ** 8 term that may occur when poly-repr of
    * \alpha ** i is shifted.
    */
  mask = 1 << 7;
  for (i = 9; i < 255; i++) {
    if (constants.GF_EXP[i - 1] >= mask) {
      constants.GF_EXP[i] = constants.GF_EXP[8] ^ ((constants.GF_EXP[i - 1] ^ mask) << 1);
    } else {
      constants.GF_EXP[i] = constants.GF_EXP[i - 1] << 1;
    }
    constants.GF_LOG[constants.GF_EXP[i]] = i;
  }
  /*
  * log(0) is not defined, so use a special value
  */
  constants.GF_LOG[0] = 255;
  /* set the extended GF_EXP values for fast multiply */
  for (i = 0; i < 255; i++) {
    constants.GF_EXP[i + 255] = constants.GF_EXP[i];
  }

  /*
  * again special cases. 0 has no INVERSE. This used to
  * be initialized to 255, but it should make no difference
  * since noone is supposed to read from here.
  */
  constants.INVERSE[0] = 0;
  constants.INVERSE[1] = 1;
  for (i = 2; i <= 255; i++) {
    constants.INVERSE[i] = constants.GF_EXP[255 - constants.GF_LOG[i]];
  }
}
