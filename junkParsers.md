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
    lang.next = 


### Language Maker



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
            state = this.state,
            symbols = state.symbols, 
            token = state.token;

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


## Event Parsing



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
