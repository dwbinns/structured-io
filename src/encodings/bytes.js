const annotate = require("../annotate");
const Annotated = require("../annotate/Annotated");
const Encoding = require("../Encoding");

class Bytes extends Annotated {
    constructor(size) {
        super();
        this.size = size;
    }

    explain(value) {
        return `[${value.length}]`;
    }

    read(bufferReader, value) {
        return bufferReader.readBytes(this.size);
    }
    write(bufferWriter, value) {
        bufferWriter.writeBytes(this.size ? value.slice(0, this.size) : value);
        if (this.size > value.length) bufferWriter.skip(this.size - value.length);
    }
}

module.exports = size => new Bytes(size);
