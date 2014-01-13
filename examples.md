# Examples

## Files

* [examples/arithmetic.js](#arithmetic "save: |jshint") Arithmetic test


## Arithmetic

We just want to parse out some arithmetic statements. 

    var Parser = require("../pratt.js");

    console.log(Parser("3+5\n7-2"));
