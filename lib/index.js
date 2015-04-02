'use strict';
/**

Portions adapted from fec.c.

This work is derived from the "fec" software by Luigi Rizzo, et al., the
copyright notice and licence terms of which are included below for reference.
fec.c -- forward error correction based on Vandermonde matrices 980624 (C)
1997-98 Luigi Rizzo (luigi@iet.unipi.it)

Portions derived from code by Phil Karn (karn@ka9q.ampr.org),
Robert Morelos-Zaragoza (robert@spectra.eng.hawaii.edu) and Hari
Thirumoorthy (harit@spectra.eng.hawaii.edu), Aug 1995

Modifications by Dan Rubenstein
Modifications (C) 1998 Dan Rubenstein (drubenst@cs.umass.edu)

Portions adapted from filefec.py, part of zfec.

Copyright (C) 2007-2010 Allmydata, Inc.
Author: Zooko Wilcox-O'Hearn

Copyright (c) 2013 Richard Kiss

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/


var createEncMatrix = require('./createEncMatrix');
var initConstants = require('./initConstants');

function Fec(k, n) {
  if (!(this instanceof Fec)) {
    return new Fec(k, n);
  }
  initConstants();
  this.k = k;
  this.n = n;
  this.stride = 4096;
  this.encMatrix = createEncMatrix(n, k);
}
Fec.prototype.encode = require('./encode');
Fec.prototype.decode = require('./decode');
module.exports = Fec;
