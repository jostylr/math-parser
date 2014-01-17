# Examples

## Files

* [examples/arithmetic.js](#arithmetic "save: |jshint") Arithmetic test


## Arithmetic

We just want to parse out some arithmetic statements. 

    var Parser = require("../index.js");

    var tree = Parser("-3_3/4+5\n7-2;\n7+\n3+2;\nx=4;\n7x");

    var arr = tree.walker(Parser.compute, {});

    console.log(arr);

Functions    

    console.log(Parser("f = (x) => 2x^2; f(3); f(1/2);").walker(Parser.compute, {}));


Function syntax:  function f (x) {..},   f = (x) => {..}  where {..} could be a block or a single expression. Arrows have the this of the surrounding context. 
