/*
* Generate GF(2**m) from the irreducible polynomial p(X) in p[0]..p[m]
* Lookup tables:
*     index->polynomial form		GF_EXP[] contains j= \alpha^i;
*     polynomial form -> index form	GF_LOG[ j = \alpha^i ] = i
* \alpha=x is the primitive element of GF(2^m)
*
* For efficiency, GF_EXP[] has size 2*GF_SIZE, so that a simple
* multiplication of two numbers can be resolved without calling modnn
*/
'use strict';
var modnn = require('./modnn');
var constants = require('./constants');

module.exports = initMulTable;

function initMulTable() {
  var i, j;
  for (i = 0; i < 256; i++) {
    for (j = 0; j < 256; j++) {
      constants.GF_MUL_TABLE[i * 256 + j] = constants.GF_EXP[modnn(constants.GF_LOG[i] + constants.GF_LOG[j])];
    }
  }

  for (j = 0; j < 256; j++) {
    constants.GF_MUL_TABLE[0 * 256 + j] = constants.GF_MUL_TABLE[j * 256 + 0] = 0;
  }
}
