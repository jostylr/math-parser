var EventWhen = require('event-when');

var emitter = new EventWhen();

emitter.register = emitter.when([], "check matches");

emitter.check = emitter.on("check matches", function (data, emitter) {
    data.data.pop();
    data.matches = [];
});

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

Parser.prototype.events = ["start", "next", "check matches", "end"];    

Parser.prototype.start = function (data, emitter) {
    this.chunk = "";
    emitter.on("next", this.next);
    emitter.register.add("parser instance done");
}

Parser.prototype.next = function (data, emitter) {
    this.chunk += data.char;
    emitter.off("next", this.next);
    emitter.emit("parser instance done", data);
}