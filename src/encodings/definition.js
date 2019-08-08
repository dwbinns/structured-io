const Annotator = require("../annotate/Annotator");
const annotate = require ("../annotate");
const Encoding = require("../Encoding");
const Scope = require("../definitions/Scope");
/*
function region(name) {
    let callbacks = {
        start: [],
        end: [],
    };

    let bufferRW;

    function regionContent(content) {
        Encoding.assert(content);
        return (new class extends Encoding {
            read(bufferReader, context, value) {

                let regionReader = bufferReader.nestedReader(name);
                bufferRW = regionReader;
                callbacks.start.forEach(callback => callback(regionReader));
                value = content.read(regionReader, context, value);
                callbacks.end.forEach(callback => callback(regionReader));
                bufferReader.eat(regionReader.getReadSize());
                return value;
            }
            write(bufferWriter, context, value) {

                let regionWriter = bufferWriter.nestedWriter();
                bufferRW = regionWriter;
                callbacks.start.forEach(callback => callback(regionWriter));
                content.write(regionWriter, context, value);
                callbacks.end.forEach(callback => callback(regionWriter));
                bufferWriter.skip(regionWriter.getSize());
            }
        });
    }

    regionContent.on = (event, callback) => {
        if (event == "start" && bufferRW) callback(bufferRW);
        else callbacks[event].push(callback);
    };

    regionContent.scopeName = name;

    return regionContent;
}

class Scope extends Encoding {
    constructor(name, factory) {
        super();
        this.factory = factory;
        this.name = name;
    }
    read(bufferReader, context, value) {
        let regions = new Array(this.factory.length).fill(0).map(() => region(this.name));
        return this.factory(...regions).read(bufferReader, context, value);
    }
    write(bufferWriter, context, value) {
        let regions = new Array(this.factory.length).fill(0).map(() => region(this.name));
        this.factory(...regions).write(bufferWriter, context, value);
    }
}
*/

class Define extends Encoding {
    constructor(definition, contentEncoding) {
        super();
        this.definition = definition;
        this.contentEncoding = Encoding.get(contentEncoding);
    }

    read(bufferReader, context, value) {
        let result = this.contentEncoding.read(bufferReader, context, value);
        this.definition.getScope().set(result);
        return result;
    }
    write(bufferWriter, context, value) {
        let here=bufferWriter.nestedWriter();
        this.contentEncoding.write(bufferWriter, context, 0);
        this.definition.getScope().listen((value) => {
            this.contentEncoding.write(here, context, value);
        });
    }
}

function definition(index) {
    let stack = [];

    function getScope() {
        return stack[stack.length - 1];
    }

    function enter() {
        stack.push(new Scope(index + 1));
    }

    function leave() {
        stack.pop().checkCalled();
    }

    function define(contentEncoding) {
        return new Define(self, contentEncoding);
    }

    let self = Object.assign(define, {enter, leave, getScope});

    return self;
}



class Definition extends Encoding {
    constructor(factory) {
        super();
        this.definitions = new Array(factory.length).fill(0).map((_, index) => definition(index));
        this.content = factory(...this.definitions);
    }

    read(bufferReader, context, value) {
        try {
            this.definitions.forEach(definition => definition.enter());
            let result = this.content.read(bufferReader, context, value);
            this.definitions.forEach(definition => definition.leave());
            return result;
        } finally {
            
        }
    }
    write(bufferWriter, context, value) {
        try {
            this.definitions.forEach(definition => definition.enter());
            this.content.write(bufferWriter, context, value);
            this.definitions.forEach(definition => definition.leave());
        } finally {
            
        }
    }
}

module.exports = annotate(() => 'definition', Definition);

