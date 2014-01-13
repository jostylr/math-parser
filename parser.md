# [math-parser](# "version: 0.1.0-pre| jostylr")

The idea is to use events to parse mathematical expressions. There is no claim to novelty, just an itch I would like to scratch and know about. 

The main target is something akin to ascii-math, but not exactly. It may expand into others, but I think that gives a good solid baseline. It may need to be modified as I am hoping for it to be computational friendly as well as display friendly. I also prefer `abc` to be a variable name while `a b c` would be the product of three variables. 

It should also parse the math-numbers numbers into the various forms. 


## Basic approach

So it reads through the string, going for various matches. The one with the longest match should win. To accomplish this, each one listens for the character event. If it still can be a match, it continues. If not, it stops and decides whether it could match it or not (maybe insufficient to match). If it is a success, it waits for the done event and then contributes its length and maybe something else. If it is a failure, it removes itself from the process. 

## Directory structure

* [pratt.js](#pratt-parser "save: |jshint")
* [index.js](#parser "save: | jshint") The primary entry point into the module
* [examples.json](#examples "save | jshint") A json of examples with supposed results
* [README.md](#readme "save:| clean raw") The standard README.
* [package.json](#npm-package "save: json  | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | clean raw") A list of growing and shrinking items todo.
* [LICENSE](#license-mit "save: | clean raw") The MIT license as I think that is the standard in the node community. 
* [.gitignore](#gitignore "save: | clean raw")

## Simple Parser

So I just want a simple parser example that will split things up using spaces and then tries to parse out arithmetic. 



    var Parser = function () {
        return this;
    };

    var pp = Parser.prototype;

    pp.parse = function (str) {
        lines = str.split("\n");
        var trees = [];
        lines.forEach(function (el) {
            var tokens = el.split(/\s+/);
            tokens.forEach(function (el) {
                if (el === "ans") {

                } else if ( ( m = el.match(/ans\[(\d+\])/) ) ) {

                } else if ( ( op = this.operator(el) ) ) {

                } else if ( ( par = this.bracket(el) ) ) 
            });
        });

    };



## Pratt Parser

This will be a Pratt parser. We will tokenize as we move along. So we first consume what we find to convert into a token. Then we use that token in the Pratt algorithm, figuring out its binding power, etc. and going through the loop, sending it to do whatever actions are in the action method of the symbol. 

This is heavily based on (copied!) from [crockford](http://javascript.crockford.com/tdop/tdop.html) The basic idea is that is that each token will have a binding power to the left. If it is stronger than what is currently dominating, then it will consume. If it is less than or equal, then the stuff to the left coalesces. 

Exampple:  a + b*c - d - e. a is 0,  + is 10,  a+b has a binding of 10, then it sees * which has a binding of 20. This is higher, so it keeps chugging, with b dangling. We get c and then we have the - which is 10. So the multiplication clicks in and we get b*c and then the + being equal to or less than the - leads to that being compiled. So we end up with  ((a + (b*c) ) - d) - e.  If we want right associative, then we lower the binding power by 1 on the right side. So then we would end up with (if - was right, but not +): ((a + (b*c) ) - (d - e) while if + was also right associative, then a + (b*c - (d - e) ). Whoosh. Not sure how the literals factor in. 

So this is a module that returns a function that takes in a string to parse and returns whatever the actions dictate being returned. For this projcet, I intend to do the computations as well a step-by-step to the text. 

    /*jslint node:true, strict:false*/

    var Num = require("math-numbers");

    var itself = function () {
        return this;
    };

    var scope, token, symbols = {};

    var symbolProto = _"Symbol Prototype";

    _"scope"

    var advance = _"advance";

    var expression = _"expression";

    _"statements"

    _"symbol makers"

    _"actual symbols"

    module.exports = function (str) {
        var ret = {};

        token = symbols["(begin)"];
        token.toParse = str;
        token.end = 0; // this should be the start of the next token
        scope = new Scope();
        advance();
        var s = statements();
        advance("(end)");
        scope = scope.pop();
        return s;
    };

### Symbol Prototype

The prototype object for the basic symbol object. 

    {
        nud: function () {
            this.error("Undefined.");
        },
        led: function (left) {
            this.error("Missing operator.");
        },
        error: function (str) {
            throw str;
        },
        log : function () {
            this.log.push( Array.prototype.slice.call(arguments) );
        }, 
        next : _"next"
    }

### Symbol Makers


This will create a symbol object. One puts in an id and binding power. An id is the key in the symbols property. The token has a property 

    var symbol = function (id, bp) {
        var s = symbols[id];
        bp = bp || 0;
        if (s) {

We can bump up the binding power using this method. Not sure what happens with the lower one. Probably best to log this.

            if (bp >= s.lbp) {
                this.log("binding power raised: " + id + " from " + s.lbp + " to " + bp);
                s.lbp = bp;
            }
        } else {
            s = Object.create(symbolProto);
            s.id = s.value = id;
            s.lbp = bp;
            symbols[id] = s;
        }
        return s;
    };

A constant builds constants into the language. ?

    var constant = function (s, v) {
        var x = symbol(s);
        x.nud = function () {
            scope.reserve(this);
            this.value = symbols[this.id].value;
            this.arity = "literal";
            return this;
        };
        x.value = v;
        return x;
    };

This is the bread and butter. An infix operator is a binary operator in the middle. 

    var infix = function (id, bp, led) {
        var s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp);
            this.arity = "binary";
            return this;
        };
        return s;
    };


Infixr is like infix except the binding should be to the right. So we subtract one from the binding power. 

    var infixr = function (id, bp, led) {
        var s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp - 1);
            this.arity = "binary";
            return this;
        };
        return s;
    };

Assignments are infixr, but we also want to add in a bit more.

    var assignment = function (id) {
        return infixr(id, 10, function (left) {
            if (left.id !== "." && left.id !== "[" && left.arity !== "name") {
                left.error("Bad lvalue.");
            }
            this.first = left;
            this.second = expression(9);
            this.assignment = true;
            this.arity = "binary";
            return this;
        });
    };

A prefix symbol comes first, such as a negative sign. Note that our minus sign in front of a literal number is absorbed into the number, but it is still important for variables. 

    var prefix = function (id, nud) {
        var s = symbol(id);
        s.nud = nud || function () {
            scope.reserve(this);
            this.first = expression(70);
            this.arity = "unary";
            return this;
        };
        return s;
    };

Adding statement symbols. 

    var stmt = function (s, f) {
        var x = symbol(s);
        x.std = f;
        return x;
    };




### Advance

We convert our text into tokens, as we go. There is a global token variable. (why?)

The advance function takes in an option id to say when to stop, otherwise it just chugs along? 

    function (id) {
        var a, o, t, v, key;

        if (id && token.id !== id) {
            _"multiple ids in advance"
        }

        if (token.id === "(end)") {
            return token;
        }

Each token will inherit a next function that will chunk up the next token. If the string ends, then it returns null and we get the end token. The return object of t should be a plain object that is used to fill in some properties of the official token.  

        t = token.next();
        if (t === null) {
            token = symbols["(end)"];
            return;            
        }

        v = t.value;
        a = t.type;


        _"advance token types"

        token = Object.create(o);
        for (key in t) {
            token[key] = t[key];
        }
        token.value = v;
        token.arity = a;
        return token;
    }

#### Advance token types

This is likely to be the same for all programming languages, but it may need replacing if attempting markup languages (not really sure, not sure if this technique is useful for those -- interested to see, but this is largely for precedence which seems mainly an issue for programming languages and arithmetic). 

Variable a is the type, o is the object that will be used as the prototype to create the token (properties come from the return of next which is in the variable t). 

    if (a === "name") {
        o = scope.find(v);
    } else if (a === "operator") {
        o = symbols[v];
        if (!o) {
            token.error("Unknown operator.");
        }
    } else if (a === "string" || a ===  "number") {
        a = "literal";
        o = symbols["(literal)"];
    } else {
        o = symbols["(error)"];
        token.error("Unexpected token."+t+a+v);
    }

#### Multiple ids in advance

We want to be able to have multiple ids for advance. Not sure if this is a good idea, but seems to be needed for statement terminations.

The idea is that if we have an operator at the end of a line, then we know the line continues (such as a comma or something). Otherwise, newline terminates. Semicolons can also be used to terminate a statement. We aim to be flexible. Yeah, I haven't learned from JavaScript's mistakes :) 

Check to see if any match. 

    if (!( Array.prototype.some.call(arguments, function (el) {
        return (el === token.id) ;
    }) ) ) {
        console.log(token);
        token.error("Found " + token.id+ ". Expected one of'" +  Array.prototype.join.call(arguments, ", ")  + "'.");
    } 

### Scope

So Crockford also implemented a scope for the variables. I changed it to the new style since it was essentially this. The variable n stands in for name, I think. e is largely a scope variable, I believe.

    var Scope = function (parent) {
        this.def = {};
        this.parent = parent;
        return this;
    };

    Scope.prototype = {
        define: function (n) {
            var t = this.def[n.value];
            if (typeof t === "object") {
                n.error(t.reserved ? "Already reserved." : "Already defined.");
            }
            this.def[n.value] = n;
            n.reserved = false;
            n.nud      = itself;
            n.led      = null;
            n.std      = null;
            n.lbp      = 0;
            n.scope    = scope;
            return n;
        },
        find: function (n) {
            var e = this, o;
            while (true) {
                o = e.def[n];
                if (o && typeof o !== 'function') {
                    return e.def[n];
                }
                e = e.parent;
                if (!e) {
                    o = symbols[n];
                    return o && typeof o !== 'function' ? o : symbols["(name)"];
                }
            }
        },
        pop: function () {
            return this.parent;
        },
        reserve: function (n) {
            if (n.arity !== "name" || n.reserved) {
                return;
            }
            var t = this.def[n.value];
            if (t) {
                if (t.reserved) {
                    return;
                }
                if (t.arity === "name") {
                    n.error("Already defined.");
                }
            }
            this.def[n.value] = n;
            n.reserved = true;
        }
    };

### Expression

This is the heart of the technique, as Crockford says. Basically, this implements the binding precedence levels. So does this operator grab bind more closely to the left thing than the previous one did to the right of it? So  a E b F c  and we need to know if (a E b) F c or  a E (b F c).  

It is very important to understand this. We pass in a right binidng power (E's bp). We are currently processing E with left already being assigned to a  (mostly).  So then we advance and get to b. This becomes the new left with the .nud yielding a something (not operator). Then we start through the loop. Presumably, rbp ??


    function (rbp) {
        var left;
        var t = token;
        advance();
        left = t.nud();
        while (rbp < token.lbp) {
            t = token;
            advance();
            left = t.led(left);
        }
        return left;
    }
    
### Statements

Now some statement work

    var statement = function () {
        var n = token, v;
        if (n.std) {
            advance();
            scope.reserve(n);
            return n.std();
        }
        v = expression(0);
        //if (!v.assignment && v.id !== "(") {
        //    v.error("Bad expression statement.");
        //}
        advance(";", "\n", "(end)");
        return v;
    };

    var statements = function () {
        var a = [], s;
        while (true) {
            console.log("while", token);
            if (token.id === "}" || token.id === "(end)") {
                break;
            }
            s = statement();
            if (s) {
                a.push(s);
            }
        }
        return a.length === 0 ? null : a.length === 1 ? a[0] : a;
    };

    var block = function () {
        var t = token;
        advance("{");
        return t.std();
    };



### Language Specific

The above should be very general Pratt parser setup. What happens below is language specific. If this all works, the above should be split into its own little litpro template module. A bit like pegjs. 

#### Next

This is the next method that defines the tokenization of the string as it processes along

It should return the next token or null if the string is exahusted. 

    function () {
        var start = this.end, 
            str = this.toParse.slice(start),
            ret = {toParse: this.toParse, 
                    start : start},
            x, m, i, sli;

We need to strip out some whitespace and account for it with the start position.

        var leading = str.match(/( +)/);
        if (leading) {
            str = str.slice(leading.length);
            ret.start = start += leading.length;
        }

Now we can try to match it. We try to match number first, then a name, and finally 

        if ( ( str.match(/^-\d|^\d/) ) ) {
            x = Num(str);
            ret.end = start+x.original.length;
            ret.value = x;
            ret.type = "number";
        } else if ( ( m = str.match(/^[a-zA-Z]+/) ) ) {
            ret.value = m[0];
            ret.end = start + m[0].length;
            ret.type = "name";
        } else {
            for (i = 3; i >0; i-=1) {
                sli = str.slice(0, i);
                if (symbols.hasOwnProperty(sli) ) {
                    ret.value = sli;
                    ret.end = start + sli.length;
                    ret.type = "operator";
                }
            }
            if (!ret.value) {
                return null;
            }
        }

        return ret;
    }


#### Actual symbols

Here we have our simple symbol lists. These are end brackets, separators, etc. and are often the target of an advance() call.

    symbol("\n");
    symbol(";");
    symbol(")");
    symbol("]");


The (end) symbol indicates the end of the token stream. The (name) symbol is the prototype for new names, such as variable names. By having parentheses, we avoid name collisions. Note that in the tokenizer used here, it could to trouble if the length being checked is as long as one of these symbols, i.e., if the length being checked was 5, then (end) in the program would match (end) instead of "(". 

    symbol("(begin)");
    symbol("(end)");
    symbol("(name)");
    symbol("(literal)").nud = itself;    
    symbol("(error)");


Then the infix operators

    infix("+", 50);
    infix("-", 50);

    infix("*", 60);
    infix("/", 60);

The exponential is an infixr

    infixr("^", 70);

Some prefix

    prefix("(", function () {
        var e = expression(0);
        advance(")");
        return e;
    });


    prefix("-");





## Usage Example

This is an example program to using this library; replace './index.js' with 'math-parser'.

    var Parser = require('./index.js');

    var parser = new Parser();

    parser.float.off(); // turns off the float parser so no float match

    parser.complex.imag('I');  //replaces i with I for the imaginary unit in parsing complex numbers.

    var parsed = parser.parse('1.3 + 5.4*6');

    console.log(parsed.evaluate().str(), parsed.str(), parsed.original); // 33.7, Num.sci('1.3').add(Num.sci('5.4').mul('6')), '1.3 + 5.4*6'

    var parsed = parser.parse('f(x) := e^(2x); f(5); x:10 | f(x) = 5 | 2 < x < 10; x+2.23');




## Parser

This is the math parser engine. The idea is to take the text and chug along it, emitting events, gobbling up that which should be a term.

    var EventWhen = require('event-when');


    var emitter = new EventWhen();

    emitter.register = emitter.when([], "check matches");

    emitter.check = emitter.on("check matches", function (data, emitter) {
        data.data.pop();
        data.matches = [];
    });

    _"parser class"

### Events

Let's diagram out what the events should be.

start  | this is to indicate the start of a new token parsing
next |  this is the next character to be analyzed
check matches | emitted from a .when that is tracking all possible parser matches
end | the end of the string is reached


### Parser Class

Each parser type will be doing very similar stuff. So let's create a class to deal with it. 

Most of the prototypes should, in general, be overwritten. But this provides a template. The handler methods can/should be passed an object whose keys will be added to the this. After they are loaded, then the relevant methods are loaded as listeners. 

    var Parser =     function (obj, emitter) {
        var key, 
            self = this;

        for (key in obj) {
            this[key] = obj[key];
        }
        this.events.forEach(function (el) {
            emitter.on(el, [ [self, self[el], {}]] );
        });

        return this;
    }

Events array prototype. Make sure to overwrite this.events if you want to modify it otherwise the events will change for all Parser instances.

    Parser.prototype.events = ["start", "next", "check matches", "end"];    

Start causes an initialization and a listener to be added. It also increments the register .when which will lead to a firing of the check matches event.

    Parser.prototype.start = function (data, emitter) {
        this.chunk = "";
        emitter.on("next", this.next);
        emitter.register.add("parser instance done");
    }

Next takes in a character and decides what to do. The default is to take one character and call it a day. Once done with trying to match (success or failure),  then the parser emits whatever was added to the register.

    Parser.prototype.next = function (data, emitter) {
        this.chunk += data.char;
        emitter.off("next", this.next);
        emitter.emit("parser instance done", data);
    }

Check matches will be called 


### Integer 

An integer could consists of an optional sign and a variety of digits as well as a separator (comma in us). No spaces involved. 

    
    emitter.on("start", function () 



### Parentheticals




### Initialize Emitter

    function () {

    }

### Next processing

???? gonna try using regexp.lastIndexOf to start search on a string. Seemes like the best option: [RegexpAPI Wrong](http://blog.stevenlevithan.com/archives/fixing-javascript-regexp).


    function (data, emitter) {
        var i = data.i,
            text = data.text;

        if (i < text.length) {
            data.char = text[i];
            data.i = i;
            emitter.emit("found char", data);
        } else {
            emitter.emit("no more characters", data);
        }
        return true;
    }

### Number matching

So the idea is that if the character is a number, then we try to parse out a number. It could also be just a period. We want to include the exponent part as well.



### Letter matching

Here we are looking for possible variable names. We consume it up until the first non word character: [A-Za-z0-9]

This should be extended to include most unicode symbols or be extensible (wordreg could be exposed). 

    function (data, emitter) {
        var i = data.i,
            text = data.text,
            wordreg = /[A-Za-z][A-Za-z0-9]*/g;  //emitter.wordreg?

        wordreg.lastIndex= i;
        match = wordreg.exec(text);
        if (match) {
            data.i = match.lastIndex;
            data.oldi = i;
            data.word = match[0];
            data.match = match;
            emitter.emit("word found", data);
            return false;
        } else {
            return true;
        }
    }

## Examples

Lots of examples. Each key is the text to be parsed. This is follow by an object with the key as to how it is evaluated (number, tex, ?)

    {
        "5 + 3" : {chain: "int(5).add(int(3))", number: 8, tex: "5 + 3"},
        "6/3" : {chain: "int(6).div(int(3)", number : 2, tex: "\frac{6}{3}"},
        "6/3 + 5" : {number:7, tex: "\frac{6}{3} + 5"},
        "6/(3+3)" : {number: 1, tex:"\frac{6}{3+3}"},
        "f(x) = sin(x)\n f(pi)" : {number: 0, tex:"f(x) = \sin(x) \\\\ f(\pi)"}
    }

6 3/5  |  int(6).add(int(3).div(int(5)))
6.24 3  |  int(6).add(int(24).div(100)).add(int(3).div(9.mul(10^2))  |  6+24/100+3/900

x = .3...
10x = 3.3...
9x = 3, x = 1/3

rep/10^length-1


x: 1 = sin(x)

x:5 1 = sin(x), 0 < x < pi, x~2, 





## README

math-parser
 ================ 

Nothing yet ...

Hopefully a multi-language (ascii-math, tex, maybe others) math parser that can easily convert math expressions into another form either for computation or printing. 

Useful link on [parsers vs lexers](http://stackoverflow.com/questions/2842809/lexers-vs-parsers)


## TODO

Everything

## NPM package

The requisite npm package file. 

[](# "json") 

    {
      "name": "DOCNAME",
      "description": "A math parser in node",
      "version": "DOCVERSION",
      "homepage": "https://github.com/GHUSER/DOCNAME",
      "author": {
        "name": "James Taylor",
        "email": "GHUSER@gmail.com"
      },
      "repository": {
        "type": "git",
        "url": "git://github.com/GHUSER/DOCNAME.git"
      },
      "bugs": {
        "url": "https://github.com/GHUSER/DOCNAME/issues"
      },
      "licenses": [
        {
          "type": "MIT",
          "url": "https://github.com/GHUSER/DOCNAME/blob/master/LICENSE-MIT"
        }
      ],
      "main": "index.js",
      "engines": {
        "node": ">0.6"
      },
      "dependencies":{
        "event-when": "=0.5.0",
        "math-numbers": ">=0.1.1"
      },
      "keywords": ["math parser"],
      "preferGlobal": "false"
    }

## gitignore

node_modules

## LICENSE MIT


The MIT License (MIT)
Copyright (c) 2013 James Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
