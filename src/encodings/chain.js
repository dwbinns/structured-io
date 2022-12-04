import Encoding from "../Encoding.js";

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

export default (where, ...components) => new Chain(components);
