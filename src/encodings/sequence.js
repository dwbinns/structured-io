const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Sequence extends Encoding {
    constructor(components) {
        super();
        this.components = Encoding.getAll(components);
    }

    read(bufferReader, context, value) {
        this.components.forEach(type => type.read(bufferReader, context, value));
        return value;
    }

    write(bufferWriter, context, value) {
        for (let type of this.components) {
            type.write(bufferWriter, context, value);
        }
    }
}

module.exports = (where, ...components) => new Sequence(components);
