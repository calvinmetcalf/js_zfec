'use strict';
module.exports = parseHeader;
var logCeil = require('./logCeil');

// The first 8 bits always encode m.
function mask(bits) {
  return (1 << bits) - 1;
}
function parseHeader(byteArray) {
  /*
  @param inf: an object which I can call read(1) on to get another byte

  @return: tuple of (m, k, pad, sh,); side-effect: the first one to four
  bytes of inf will be read
  */


  var idx = 2;
  var ch = byteArray[0];
  if (ch === 0) {
    throw 'Share files corrupted';
  }
  var m = ch + 1;

  // The next few bits encode k.
  var kbits = logCeil(m, 2); // num bits needed to store all possible values of k
  var b2BitsLeft = 8 - kbits;
  var kbitmask = mask(kbits) << b2BitsLeft;
  ch = byteArray[1];
  var k = ((ch & kbitmask) >> b2BitsLeft) + 1;

  var shbits = logCeil(m, 2); // num bits needed to store all possible values of shnum
  var padbits = logCeil(k, 2); // num bits needed to store all possible values of pad

  var val = ch & (~kbitmask);

  var neededPadbits = padbits - b2BitsLeft;
  if (neededPadbits > 0) {
    ch = byteArray[idx++];
    val <<= 8;
    val |= ch;
    neededPadbits -= 8;
  }
  //assert neededPadbits <= 0
  var extrabits = -neededPadbits;
  var pad = val >> extrabits;
  val &= mask(extrabits);

  var neededShbits = shbits - extrabits;
  if (neededShbits > 0) {
    ch = byteArray[idx++];
    val <<= 8;
    val |= ch;
    neededShbits -= 8;
  }
//assert neededShbits <= 0

  var gotshbits = -neededShbits;

  var sh = val >> gotshbits;

  return [m, k, pad, sh, idx];
}
