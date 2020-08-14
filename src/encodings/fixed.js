const annotate = require("../annotate");
const Encoding = require("../Encoding");
const getEncoding = require("../getEncoding");

class Fixed extends Encoding {
    constructor(encoding, value) {
        super();
        this.encoding = getEncoding(encoding);
        this.value = value;
    }
    read(bufferReader, context, value) {
        let readValue= this.encoding.read(bufferReader, context, value);
        if (readValue != this.value) {
            throw new Error(`Unexpected value, read:${readValue}, expected: ${this.value}`);
        }
        return readValue;
    }
    write(bufferWriter, context, value) {
        this.encoding.write(bufferWriter, context, this.value);
    }
}

module.exports = annotate((v, encoding, value) => `fixed(${value})`, Fixed);
