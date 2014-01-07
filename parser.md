# [math-parser](# "version: 0.1.0-pre| jostylr")

The idea is to use events to parse mathematical expressions. There is no claim to novelty, just an itch I would like to scratch and know about. 

The main target is something akin to ascii-math, but not exactly. It may expand into others, but I think that gives a good solid baseline. It may need to be modified as I am hoping for it to be computational friendly as well as display friendly. I also prefer `abc` to be a variable name while `a b c` would be the product of three variables. 

It should also parse the math-numbers numbers into the various forms. 


## Basic approach

So it reads through the string, going for various matches. The one with the longest match should win. To accomplish this, each one listens for the character event. If it still can be a match, it continues. If not, it stops and decides whether it could match it or not (maybe insufficient to match). If it is a success, it waits for the done event and then contributes its length and maybe something else. If it is a failure, it removes itself from the process. 

## Directory structure

* [simple.js](#simple-parser "save: |jshint")
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

This is heavily based on (copied!) from [crockford](http://javascript.crockford.com/tdop/tdop.html)

But I want to be able to switch modes from one language to another easily. To this end, each language will have its own symbol table which will be accessed via this by a token. Also the advance function and other such things will be in the token property. 

So here is our object chain: A Base object with common methods across languages. All tokens will have their prototype chains end with this base object. The next one up is the Language object which is different for each language one would use. This has the symbol table prototype that can then be used to create the live symbol tables when parsing strings (that could add symbols locally). It is on this that we create the initial  It could also be used to create forks of languages. Each symbol inherits from Base and each token will inherit from its symbol type. 

When we want to parse a "program", then that creates a new state object which holds things such as the current token and the string itself. Each token should have it as a property under state. 


The prototype Base for symbols gives us some error reporting capabilities if not defined. We also add a log object. We use symbols as a prototype object for fully parsed tokens. As such, we also have the next method which deals with getting the next token from the string.


    var Base = {
        nud: function () {
            this.error("Undefined.");
        },
        led: function (left) {
            this.error("Missing operator.");
        },
        error: function (str) {
            throw str;
        },
        log : function (arguments) {
            this.log.push( Array.prototype.slice.call(arguments) );
        },
        languageMaker : function () {
            var o = Object.create(this.proto);
            o.symbols = {};
            o.proto = o;
        }
        symbolMaker : _"symbol maker",
        advance : _"token advancement"
    };

    Base.proto = Base;

The proto property is the object to use make the symbol. This allows for keeping the same symbol maker with the prototype varying from just changing the proto property on the object. If you need to. Also keeps references clearer, I suppose. 

[example]()

    var lang = Base.languageMaker();


### Symbol Maker


This will create a symbol object. One puts in an id and binding power. An id is the key in the symbols property. The token has a property 

    function (id, bp) {
        var s = this.symbols[id];
        bp = bp || 0;
        if (s) {

We can bump up the binding power using this method. Not sure what happens with the lower one. Probably best to log this.

            if (bp >= s.lbp) {
                this.log("binding power raised: " + id + " from " + s.lbp + " to " + bp);
                s.lbp = bp;
            }
        } else {
            s = Object.create(this.proto);
            s.id = s.value = id;
            s.lbp = bp;
            this.symbols[id] = s;
        }
        return s;
    }




### Token advancement

We convert our text into tokens, as we go. There is a global token variable. (why?)

The advance function takes in an option id to say when to stop, otherwise it just chugs along? 

    function (id) {
        var a, o, t, v, 
            symbols = this.state.symbols, 
            token = this.state.token;

        if (id && token.id !== id) {
            token.error("Expected '" + id + "'.");
        }

Each token will inherit a next function that will chunk up the next token. If the string ends, then it returns null and we get the end token. The return object of t should be a plain object that is used to fill in some properties of the official token.  

        t = token.next();
        if (t === null) {
            token = Object.create(symbols["(end)"], t);
            return;            
        }

        v = t.value;
        a = t.type;

        if (a === "name") {
            o = scope.find(v);
        } else if (a === "operator") {
            o = symbol_table[v];
            if (!o) {
                t.error("Unknown operator.");
            }
        } else if (a === "string" || a ===  "number") {
            a = "literal";
            o = symbol_table["(literal)"];
        } else {
            t.error("Unexpected token.");
        }
        token = Object.create(o, t);
        token.value = v;
        token.arity = a;
        return token;
    };


### Language Arithmetic

#### Next

This is the next method that defines the tokenization of the string as it processes along

    next : function () {
        var toParse = this.toParse, token;
        
        _"nextToken"

        return token;
    },

#### Simple symbols

Here we have our simple symbol lists. These are end brackets, separators, etc. and are often the target of an advance() call.

    symbol(":");
    symbol(";");
    symbol(",");
    symbol(")");
    symbol("]");
    symbol("}");
    symbol("else");


The (end) symbol indicates the end of the token stream. The (name) symbol is the prototype for new names, such as variable names. The parentheses that I've included in the ids of these symbols avoid collisions with user-defined tokens.

    symbol("(end)");
    symbol("(name)");




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
        data.data..pop();
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
        "event-when": "=0.5.0"
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
