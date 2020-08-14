const Encoding = require("../Encoding");
const getEncoding = require("../getEncoding");

class Sequence extends Encoding {
    constructor(components) {
        super();
        this.components = components.map(getEncoding);
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

module.exports = (...components) => new Sequence(components);
