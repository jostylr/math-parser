/*global require*/

var Num, test;

Parser = require('../index.js');
test = require('tape');

test("basic test", function (t) {
        t.deepEqual(Parser("-3_3/4+5\n7-2;\n7+\n3+2;\nx=4;\n7x").walker(Parser.compute, {}), [ '1_1/4', '5', '12', '28' ], "-3_3/4+5\n7-2;\n7+\n3+2;\nx=4;\n7x");
    
        t.end();
    });