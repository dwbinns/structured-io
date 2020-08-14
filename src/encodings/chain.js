const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Chain {
    constructor(components) {
        this.components = Encoding.getAll(components);
    }

    read(bufferReader, context, value) {
        return this.components.reduce((result, encoding) => encoding.read(bufferReader, context, result), value);
    }
    write(bufferWriter, context, value) {
        for (let encoding of this.components) {
            encoding.write(bufferWriter, context, value);
        }
    }
}

module.exports = (where, ...components) => new Chain(components);
