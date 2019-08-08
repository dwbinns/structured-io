const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Bytes extends Encoding {
    constructor(size) {
        super();
        this.size = size;
    }

    read(bufferReader, context, value) {
        return bufferReader.readBytes(this.size);
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeBytes(this.size ? value.slice(0, this.size) : value);
        if (this.size > value.length) bufferWriter.skip(this.size - value.length);
    }
}

module.exports = annotate(v => `bytes: ${v.length}`, Bytes);