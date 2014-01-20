# Examples

## Files

* [examples/arithmetic.js](#arithmetic "save: |jshint") Arithmetic test
* [examples/newton.math](#newton "save: ") Newton's method applied


## Arithmetic

We just want to parse out some arithmetic statements. 

    var Parser = require("../index.js");

    var tree = Parser("-3_3/4+5\n7-2;\n7+\n3+2;\nx=4;\n7x");

    var arr = tree.walker(Parser.compute, {});

    console.log(arr);

Functions    

    console.log(Parser("f =  x, y, z. => 2x^2+3y-5z; f(3); f(1/2);").walker(Parser.compute, {}));


Function syntax:   {..},   f = (x) -> {..}  where {..} could be a block or a single expression. Arrows have the this of the surrounding context. 


x_1, x[1], x_i^2 x_a,b,c^d,e,f


## Newton's Method

Let's try to write out a bit of text 

    f = x -> x^2
    g = x ->2x
    x_i = x_i-1.-f(x_i-1.)/g(x_i-1.), x_0= 1.4, i = 0..20:1, :30
    plot(x_i, f(x_i))