'use strict';

var initMulTable = require('./initMulTable');
var generateGf = require('./generateGf');

var constantsInitialized = false;

module.exports = initConstants;

function initConstants() {
  if (constantsInitialized) {
    return;
  }
  constantsInitialized = true;
  generateGf();
  initMulTable();
}
