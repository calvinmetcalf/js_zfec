'use strict';

var logCeil = require('./logCeil');

module.exports = buildHeader;

function buildHeader(m, k, pad, sh) {
  /*
  @param m: the total number of shares; 1 <= m <= 256
  @param k: the number of shares required to reconstruct; 1 <= k <= m
  @param pad: the number of bytes of padding added to the file before encoding; 0 <= pad < k
  @param sh: the shnum of this share; 0 <= k < m

  @return: a compressed string encoding m, k, pad, and sh
  */

  var bitsused = 0;
  var val = 0;

  val |= (m - 1);
  bitsused += 8; // the first 8 bits always encode m

  var kbits = logCeil(m, 2); // num bits needed to store all possible values of k
  val <<= kbits;
  bitsused += kbits;

  val |= (k - 1);

  var padbits = logCeil(k, 2); // num bits needed to store all possible values of pad
  val <<= padbits;
  bitsused += padbits;

  val |= pad;

  var shnumbits = logCeil(m, 2); // num bits needed to store all possible values of shnum
  val <<= shnumbits;
  bitsused += shnumbits;

  val |= sh;

  if (bitsused <= 16) {
    val <<= (16 - bitsused);
    return new Uint8Array([(val >> 8) & 0xff, (val >> 0) & 0xff]);
  }
  if (bitsused <= 24) {
    val <<= (24 - bitsused);
    return new Uint8Array([(val >> 16) & 0xff, (val >> 8) & 0xff, (val >> 0) & 0xff]);
  }
  val <<= (32 - bitsused);
  return new Uint8Array([(val >> 24) & 0xff, (val >> 16) & 0xff, (val >> 8) & 0xff, (val >> 0) & 0xff]);
}
