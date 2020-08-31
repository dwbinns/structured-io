
const Encoding = require("../Encoding");
const getEncoding = require("../getEncoding");
const {ceil} = Math;

class Pad extends Encoding {
    constructor(padSize, contentEncoding) {
        super();
        this.contentEncoding = getEncoding(contentEncoding);
        this.padSize = padSize;
    }
    read(bufferReader, value) {
        let subReader = bufferReader.here();
        value = this.contentEncoding.read(subReader, value);
        let readSize = subReader.getReadSize();
        bufferReader.eat(ceil(readSize / this.padSize) * this.padSize);
        return value;
    }
    write(bufferWriter, value) {
        let nestedWriter = bufferWriter.here();
        this.contentEncoding.write(nestedWriter, value);
        let size = nestedWriter.getSize();
        bufferWriter.skip(ceil(size / this.padSize) * this.padSize);
    }
}

module.exports = (...args) => new Pad(...args);
