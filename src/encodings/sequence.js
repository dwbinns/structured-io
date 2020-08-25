const Encoding = require("../Encoding");
const getEncoding = require("../getEncoding");

class Sequence extends Encoding {
    constructor(components) {
        super();

        this.components = components.map(getEncoding);
    }

    read(bufferReader, value) {
        this.components.forEach(type => type.read(bufferReader, value));
        return value;
    }

    write(bufferWriter, value) {
        for (let type of this.components) {
            type.write(bufferWriter, value);
        }
    }
}

module.exports = (...components) => new Sequence(components);
