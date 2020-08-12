const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Ignore extends Encoding {
    constructor(size) {
        super();
        this.size = size;
    }
    read(bufferReader, context, value) {
        bufferReader.eat(this.size);
        return value;
    }
    write(bufferWriter, context, value) {
        bufferWriter.skip(this.size);
    }
}

module.exports = annotate((v, size) => `ignore: ${size}`, Ignore);
