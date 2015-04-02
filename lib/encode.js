'use strict';
var buildHeader = require('./buildHeader');
var addmul = require('./addmul');
module.exports = encode;
function encode(src, blockNumber) {
  var i, j;
  var k;
  var sz = Math.ceil(src.length / this.k);
  var pad = sz * this.k - src.length;
  var fecs = [];
  var headerLength;
  blockNumber = blockNumber || this.n;

  var blockNumberArray = [];
  for (i = 0; i < blockNumber; i++) {
    blockNumberArray.push(i);
  }

  for (i = 0; i < blockNumberArray.length; i++) {
    var header = buildHeader(this.n, this.k, pad, i);
    headerLength = header.length;
    fecs.push(new Uint8Array(sz + headerLength));
    for (j = 0; j < headerLength; j++) {
      fecs[i][j] = header[j];
    }
  }

  for (k = 0; k < sz; k += this.stride) {
    var stride = ((sz - k) < this.stride) ? (sz - k) : this.stride;
    for (i = 0; i < blockNumberArray.length; i++) {
      var fecnum = blockNumberArray[i];
      var fec = fecs[i];
      var p = fecnum * this.k;
      for (j = 0; j < this.k; j++) {
        addmul(fec, headerLength + k, src, j * stride + k * this.k, this.encMatrix[p + j], stride);
      }
    }
  }
  return fecs.map(function (item) {
    return new Buffer(item);
  });
}
