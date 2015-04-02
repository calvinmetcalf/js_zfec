'use strict';

var parseHeader = require('./parseHeader');
var addmul = require('./addmul');
var constants = require('./constants');
var gfMul = require('./gfMul');
module.exports = decode;

function decode(inputArray) {
  var row;
  var col;
  var indices = [];
  var idx;
  var pad;
  inputArray = inputArray.map(function (item) {
    return new Uint8Array(item);
  });
  for (idx = 0; idx < inputArray.length; idx++) {
    var tuple = parseHeader(inputArray[idx]);
    pad = tuple[2];
    indices.push(tuple[3]);
    inputArray[idx] = inputArray[idx].subarray(tuple[4]);
  }

  var sizePerRow = inputArray[0].length;
  var sz = sizePerRow * this.k;
  var output = new Uint8Array(sz);

  for (row = 0; row < indices.length; row++) {
    if ((indices[row] < this.k) && (indices[row] !== row)) {
      var tmp = inputArray[row];
      inputArray[row] = inputArray[indices[row]];
      inputArray[indices[row]] = tmp;
      tmp = indices[row];
      indices[row] = indices[tmp];
      indices[tmp] = tmp;
    }
  }



  var decodeMatrix = buildDecodeMatrix(this, indices);

  var k;
  for (k = 0; k < sizePerRow; k += this.stride) {
    var stride = (sizePerRow - k < this.stride) ? sizePerRow - k : this.stride;
    var outStride = k * this.k;
    for (row = 0; row < this.k; row++) {
      if (indices[row] < this.k) {
        for (col = 0; col < stride; col++) {
          output[row * stride + outStride + col] = inputArray[indices[row]][k + col];
        }
      } else {
        for (col = 0; col < this.k; col++) {
          addmul(output, row * stride + outStride, inputArray[col], k, decodeMatrix[row * this.k + col], stride);
        }
      }
    }
  }
  return new Buffer(output.subarray(0, sz - pad));
}

/**
* Build decode matrix into some memory space.
*
* @param matrix a space allocated for a k by k matrix
*/
function buildDecodeMatrix(fec, indices) {
  var k = fec.k;
  var matrix = new Uint8Array(k * k);
  var i, j;
  var p;
  for (i = 0, p = 0; i < k; i++, p += k) {
    if (indices[i] < k) {
      for (j = 0; j < k; j++) {
        matrix[p + j] = 0;
      }
      matrix[p + indices[i]] = 1;
    } else {
      for (j = 0; j < k; j++) {
        matrix[p + j] = fec.encMatrix[indices[i] * k + j];
      }
    }
  }
  invertMat(matrix, k);
  return matrix;
}

function invertMat(src, k) {
  var c, p;
  var irow = 0;
  var icol = 0;
  var row, col, i, ix;

  var indxc = new Uint8Array(k);
  var indxr = new Uint8Array(k);
  var ipiv = new Uint8Array(k);
  var idRow = new Uint8Array(k);

/*
* ipiv marks elements already used as pivots.
*/
  for (i = 0; i < k; i++) {
    ipiv[i] = 0;
  }

  for (col = 0; col < k; col++) {
    var foundPiv = 0;
  /*
  * Zeroing column 'col', look for a non-zero element.
  * First try on the diagonal, if it fails, look elsewhere.
  */
    if (ipiv[col] !== 1 && src[col * k + col] !== 0) {
      irow = col;
      icol = col;
      foundPiv = 1;
    }
    for (row = 0; row < k; row++) {
      if (foundPiv) {
        break;
      }
      if (ipiv[row] !== 1) {
        for (ix = 0; ix < k; ix++) {
          if (ipiv[ix] === 0) {
            if (src[row * k + ix] !== 0) {
              irow = row;
              icol = ix;
              foundPiv = 1;
              break;
            }
          }
        }
      }
    }
    //foundPiv:
    ipiv[icol] += 1;
    /*
    * swap rows irow and icol, so afterwards the diagonal
    * element will be correct. Rarely done, not worth
    * optimizing.
    */
    if (irow !== icol) {
      for (ix = 0; ix < k; ix++) {
        var tmp = src[irow * k + ix];
        src[irow * k + ix] = src[icol * k + ix];
        tmp = src[icol * k + ix];
      }
    }
    indxr[col] = irow;
    indxc[col] = icol;
    //pivot_row = &src[icol * k];
    c = src[icol * k + icol];
    //assert (c != 0);
    if (c !== 1) {                       /* otherwhise this is a NOP */
    /*
    * this is done often , but optimizing is not so
    * fruitful, at least in the obvious ways (unrolling)
    */
      c = constants.INVERSE[c];
      src[icol * k + icol] = 1;
      for (ix = 0; ix < k; ix++) {
        src[icol * k + ix] = gfMul(c, src[icol * k + ix]);
      }
    }
    /*
    * from all rows, remove multiples of the selected row
    * to zero the relevant entry (in fact, the entry is not zero
    * because we know it must be zero).
    * (Here, if we know that the pivot_row is the identity,
    * we can optimize the addmul).
    */
    idRow[icol] = 1;
    if (memcmp(src, icol * k, idRow, 0, k) !== 0) {
      for (p = 0, ix = 0; ix < k; ix++, p += k) {
        if (ix !== icol) {
          c = src[icol + p];
          src[icol + p] = 0;
          addmul(src, p, src, icol * k, c, k);
        }
      }
    }
    idRow[icol] = 0;
  }                           /* done all columns */
  for (col = k; col > 0; col--) {
    if (indxr[col - 1] !== indxc[col - 1]) {
      for (row = 0; row < k; row++) {
        tmp = src[row * k + indxr[col - 1]];
        src[row * k + indxr[col - 1]] = src[row * k + indxc[col - 1]];
        src[row * k + indxc[col - 1]] = tmp;
      }
    }
  }
}
function memcmp(src, srcIdx, dst, dstIdx, size) {
  var i;
  for (i = 0; i < size; i++) {
    if (src[srcIdx + i] !== dst[dstIdx + i]) {
      return 1;
    }
  }
  return 0;
}
/*
* Various linear algebra operations that i use often.
*/
