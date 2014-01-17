# Tests

We need tests. So here they are. 

* [test/testrunner.js](#testrunner "save: |jshint")

## Testrunner

This is a simple test runner. 


    /*global require*/


    var Num, test;

    Parser = require('../index.js');
    test = require('tape');

    test("basic test", _"basic test");

test("assignment", _"assignment types");

### Basic Test

This is the basic parsing test: 

    function (t) {
        t.deepEqual(Parser("-3_3/4+5\n7-2;\n7+\n3+2;\nx=4;\n7x").walker(Parser.compute, {}), [ '1_1/4', '5', '12', '28' ], "-3_3/4+5\n7-2;\n7+\n3+2;\nx=4;\n7x");

        t.end();
    }

### Assignment Types

Here are tests for getting the various assignment roles right.

    function (t) {
        t.deepEqual(Parser("f(x) = 2x^2; f(3); f(1/2);").walker(Parser.compute, {}), ["18", "1/2"], "f(x) = 2x^2; f(3); f(1/2);");    

        t.end();
    }