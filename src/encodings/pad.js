
const Encoding = require("../Encoding");
const annotate = require("../annotate");
const {ceil} = Math;

class Pad extends Encoding {
    constructor(padSize, contentEncoding) {
        super();
        this.contentEncoding = Encoding.get(contentEncoding);
        this.padSize = padSize;
    }
    read(bufferReader, context, value) {
        let subReader = bufferReader.subReader();
        value = this.contentEncoding.read(subReader, context, value);
        let readSize = subReader.getReadSize();
        bufferReader.eat(ceil(readSize / this.padSize) * this.padSize);
        return value;
    }
    write(bufferWriter, context, value) {
        let nestedWriter = bufferWriter.nestedWriter();
        this.contentEncoding.write(nestedWriter, context, value);
        let size = nestedWriter.getSize();
        bufferWriter.skip(ceil(size / this.padSize) * this.padSize);
    }
}

module.exports = annotate((_, padSize) => `pad(${padSize})`, Pad);
