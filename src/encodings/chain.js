const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Chain {
    constructor(components) {
        this.components = Encoding.getAll(components);
    }

    read(bufferReader, value) {
        return this.components.reduce((result, encoding) => encoding.read(bufferReader, result), value);
    }
    write(bufferWriter, value) {
        for (let encoding of this.components) {
            encoding.write(bufferWriter, value);
        }
    }
}

module.exports = (where, ...components) => new Chain(components);
