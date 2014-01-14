# Examples

## Files

* [examples/arithmetic.js](#arithmetic "save: |jshint") Arithmetic test


## Arithmetic

We just want to parse out some arithmetic statements. 

    var Parser = require("../pratt.js");

    console.log(Parser("-3_3/4+5\n7-2;\n7+\n3+2\n"));
