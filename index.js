/*jslint node:true, strict:false*/

var Num = require("math-numbers");

var itself = function () {
    return this;
};

var scope, token, toParse, symbols = {};

var symbolProto = {
        nud: function () {
            this.error("Undefined nud for "+this.value);
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
        next : function () {
                var start = this.end, 
                    str = toParse.slice(start),
                    ret = { start : start, parent : token},
                    x, m, i, sli, 
                    token = this;
            
                var leading = (token.type === "operator") ? str.match(/^\s+/)  : str.match(/^( +)/);
                if (leading) {
                    str = str.slice(leading.length);
                    ret.start = start += leading.length;
                }
            
                if ( ( str.match(/^\d/) ) ) {
                    x = Num(str);
                    ret.end = start+x.original.length;
                    ret.value = x;
                    ret.type = "number";
                } else if ( ( m = str.match(/^[a-zA-Z]+/) ) ) {
            
                    if ( (token.arity === "name")  || (token.arity === "literal") ) {
                        ret.value = "*";
                        ret.end = start;
                        ret.type = "operator";
                    } else {
                        ret.value = m[0];
                        ret.end = start + m[0].length;
                        ret.type = "name";
                    }
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
                        ret.end = start;
                        ret.value = "(end)";
                    }
                }
                return ret;
            },
        walker : function (actions, state) {
                var self = this, arr;
                if (Array.isArray(self) ) {
                    arr = [];
            
                    self.forEach(function (el) {
                        arr.push(el.walker(actions, state));
                    });            
            
                    
                    return actions.array(arr);
                }
            
                if (self.type === "number") {
                   return actions.number(self, actions, state);
                }
            
                if (self.type === "operator") {
                    return actions[self.value](self, actions, state);
                }
            
                if (self.type === "name") {
                    return state[self.value].walker(actions, state);
                }
            
            }
    };

var Scope = function (parent) {
    this.def = {};
    this.parent = parent;
    return this;
};

Scope.prototype = {
    define: function (n) {
        var t = this.def[n.value];
        if (typeof t === "object") {
            if (t.reserved) {
                n.error("Already reserved");
            } else {
                return n;
            }
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

    existence : function (n) {
        var t = this.def[n.value];
        if (typeof t === "object") {
            if (t.reserved) {
                return false;
            } else {
                return true;
            } 
        }
        return false;
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

var advance = function (id) {
        var a, o, t, v, key;
    
        if (id && token.id !== id) {
            if (!( Array.prototype.some.call(arguments, function (el) {
                return (el === token.id) ;
            }) ) ) {
                token.error("Found " + token.id+ ". Expected one of'" +  Array.prototype.join.call(arguments, ", ")  + "'.");
            } 
        }
    
        if (token.id === "(end)") {
            return token;
        }
    
        t = token.next();
        if (t.value === "(end)") {
            token = Object.create(symbols["(end)"]);
            return;            
        }
    
        v = t.value;
        a = t.type;
    
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
    
        token = Object.create(o);
        for (key in t) {
            token[key] = t[key];
        }
        token.value = v;
        token.arity = a;
        return token;
    };

var expression = function (rbp) {
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
    };

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
    a.walker = symbolProto.walker;  // to walk the statements
    while (true) {
        if (token.id === "}" || token.id === "(end)") {
            break;
        }
        s = statement();
        if (s) {
            a.push(s);
        }
    }
    return a;   //  array is good to have. a.length === 0 ? null : a.length === 1 ? a[0] : a;
};

var block = function () {
    var t = token;
    advance("{");
    return t.std();
};

var symbol = function (id, bp) {
    var s = symbols[id];
    bp = bp || 0;
    if (s) {

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

var assignment = function (id) {
    return infixr(id, 10, function (left) {
        if (left.id !== "." && left.id !== "[" && left.arity !== "name") {
            left.error("Bad lvalue.");
        }
        if (left.arity === "name") {
            scope.define(left);
        }
        this.first = left;
        this.second = expression(9);
        this.assignment = true;
        this.arity = "binary";
        return this;
    });
};

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

var stmt = function (s, f) {
    var x = symbol(s);
    x.std = f;
    return x;
};

symbol("\n");
symbol(";");
symbol(")");
symbol("]");

symbol("(begin)");
symbol("(end)");
symbol("(name)").nud = itself;
symbol("(literal)").nud = itself;    
symbol("(error)");

infix("+", 50);
infix("-", 50);

infix("*", 60);
infix("/", 60);

infixr("^", 70);

prefix("(", function () {
    var e = expression(0);
    advance(")");
    return e;
});

prefix("-");

assignment("=");

module.exports = function (str) {
    var ret = {};

    token = symbols["(begin)"];
    toParse = str;
    token.end = 0; // this should be the start of the next token
    scope = new Scope();
    advance();
    var s = statements();
    advance("(end)");
    scope = scope.pop();
    return s;
};

module.exports.compute = { 
        "-" : function (self, actions, state) {
            if (self.arity === "binary") {
                return self.first.walker(actions, state).sub(self.second.walker(actions, state));
            } else {
                return self.first.walker(actions, state).neg();
            }
        },
        "+" : function (self, actions, state) {
                return self.first.walker(actions, state).add(self.second.walker(actions, state));
        },
        "*" : function (self, actions, state) {
                return self.first.walker(actions, state).mul(self.second.walker(actions, state));
        },
        "/" : function (self, actions, state) {
                return self.first.walker(actions, state).div(self.second.walker(actions, state));
        },
        "^" : function (self, actions, state) {
                return self.first.walker(actions, state).ipow(self.second.walker(actions, state));
        }, // !!!! should change this to pow when I have it
    
        "=" : function (self, actions, state) {
            if (self.first.type === "name") {   
                state[self.first.value] = self.second;
            } else {
                console.log("add more functionality to assignment to handle this: ",  self);
            }
        },
    
        array : function (arr, actions, state) {
            var i, n = arr.length, el;
            var ret = [];
            for (i = 0; i < n; i += 1) {
                el = arr[i];
                if (el && el.str ) {
                    ret.push(el.str());
                } else if (arr[i]) {
                    ret.push(toString());
                } 
            }
            return ret;
        },
        number : function (self) {
            return self.value;
        }
    
    };