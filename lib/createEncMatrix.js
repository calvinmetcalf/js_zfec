'use strict';

module.exports = createEncMatrix;
var constants = require('./constants');
var modnn = require('./modnn');
var gfMul = require('./gfMul');
function createEncMatrix(n, k) {
  var row, col;
  var p, tmpM;

  var encMatrix = new Uint8Array(n * k);
  tmpM = new Uint8Array(n * k);
  /*
  * fill the matrix with powers of field elements, starting from 0.
  * The first row is special, cannot be computed with exp. table.
  */
  tmpM[0] = 1;
  for (col = 1; col < k; col++) {
    tmpM[col] = 0;
  }
  for (p = k, row = 0; row < n - 1; row++, p += k) {
    for (col = 0; col < k; col++) {
      tmpM[p + col] = constants.GF_EXP[modnn(row * col)];
    }
  }

  /*
  * quick code to build systematic matrix: invert the top
  * k*k vandermonde matrix, multiply right the bottom n-k rows
  * by the INVERSE, and construct the identity matrix at the top.
  */
  invertVdm(tmpM, k);        /* much faster than invertMat */
  matmul(tmpM.subarray(k * k), tmpM, encMatrix.subarray(k * k, n * k), n - k, k, k);
  /*
  * the upper matrix is I so do not bother with a slow multiply
  */
  var i;
  for (i = 0; i < k * k; i++) {
    encMatrix[i] = 0;
  }
  for (p = 0, col = 0; col < k; col++, p += k + 1) {
    encMatrix[p] = 1;
  }
  return encMatrix;
}
function matmul(a, b, c, n, k, m) {
  var row, col, i;

  for (row = 0; row < n; row++) {
    for (col = 0; col < m; col++) {
      var acc = 0;
      for (i = 0; i < k; i++) {
        acc ^= gfMul(a[row * k + i], b[col + m * i]);
      }
      c[row * m + col] = acc;
    }
  }
}



/*
* invertMat() takes a matrix and produces its inverse
* k is the size of the matrix.
* (Gauss-Jordan, adapted from Numerical Recipes in C)
* Return non-zero if singular.
*/

/*
* fast code for inverting a vandermonde matrix.
*
* NOTE: It assumes that the matrix is not singular and _IS_ a vandermonde
* matrix. Only uses the second column of the matrix, containing the pI's.
*
* Algorithm borrowed from "Numerical recipes in C" -- sec.2.8, but largely
* revised for my purposes.
* p = coefficients of the matrix (pI)
* q = values of the polynomial (known)
*/
function invertVdm (src, k) {
  var i, j, row, col;
  var b, c, p;
  var t, xx;

  if (k === 1) {                  /* degenerate case, matrix must be p^0 = 1 */
    return;
  }
  /*
  * c holds the coefficient of P(x) = Prod (x - pI), i=0..k-1
  * b holds the coefficient for the matrix inversion
  */
  c = new Uint8Array(k);
  b = new Uint8Array(k);

  p = new Uint8Array(k);

  for (j = 1, i = 0; i < k; i++, j += k) {
    c[i] = 0;
    p[i] = src[j];            /* p[i] */
  }
/*
* construct coeffs. recursively. We know c[k] = 1 (implicit)
* and start P_0 = x - p_0, then at each stage multiply by
* x - pI generating pI = x P_{i-1} - pI P_{i-1}
* After k steps we are done.
*/
  c[k - 1] = p[0];              /* really -p(0), but x = -x in GF(2^m) */
  for (i = 1; i < k; i++) {
    var pI = p[i];            /* see above comment */
    for (j = k - 1 - (i - 1); j < k - 1; j++){
      c[j] ^= gfMul(pI, c[j + 1]);
    }
    c[k - 1] ^= pI;
  }

  for (row = 0; row < k; row++) {
    /*
    * synthetic division etc.
    */
    xx = p[row];
    t = 1;
    b[k - 1] = 1;             /* this is in fact c[k] */
    for (i = k - 1; i > 0; i--) {
      b[i - 1] = c[i] ^ gfMul(xx, b[i]);
      t = gfMul(xx, t) ^ b[i - 1];
    }
    for (col = 0; col < k; col++) {
      src[col * k + row] = gfMul(constants.INVERSE[t], b[col]);
    }
  }
}
