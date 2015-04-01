var test = require("tape");

var fec = require("./fec");

function string_to_uint8(s) {
    return new Buffer(s);
}

function uint8_to_string(ui) {
  return ui.toString();
    // var s, i;
    // s = '';
    // if (!Buffer.isBuffer(ui)) {
    //   ui = new Buffer(ui);
    // }
    // for (i=0;i<ui.length;i++) {
    //     s += String.fromCharCode(ui[i]);
    // }
    // return s;
}
var i = 0;
function test_encode_decode(st) {
  var s = new Buffer(st);
  test('run ' + ++i, function (t){

    var f = fec(3, 10);
    var encoded = f.encode(s, 6);
    var i;
    var decoded;
    var tuples = [[0,1,2], [0,1,4], [0,1,3], [0,2,4], [0,1,5], [3,4,5], [2,3,4], [2,3,5], [2,4,5]];
    for (i = 0; i < tuples.length; i++) {
      var tuple = tuples[i];
      decoded = f.decode([encoded[tuple[0]], encoded[tuple[1]], encoded[tuple[2]]], tuple);
      t.equal(decoded.toString(), st);
    }
    t.end();
  });
}

test_encode_decode("123456789");
test_encode_decode("0123456789");
test_encode_decode("0123456789abcdefghijklmnop");
test_encode_decode("Please kill me");
test_encode_decode("The quick brown fox jumps over the lazy dogs.");

var s = "abcdefghijklmnopqrstuvwxyz.!^*4&Y#&^(*&$(*&$(*%&@*($&%*($&%)))))";

// while (s.length<163840) {
//     test_encode_decode(s);
//     s = s + s;
// }
