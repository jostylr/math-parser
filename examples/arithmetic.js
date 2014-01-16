var Parser = require("../index.js");

var tree = Parser("-3_3/4+5\n7-2;\n7+\n3+2;\nx=4;\n7x");

var arr = tree.walker(Parser.compute, {});

console.log(arr);