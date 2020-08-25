const annotate = require("../annotate");
const Annotated = require("../annotate/Annotated");
const Encoding = require("../Encoding");
const getEncoding = require("../getEncoding");

class Fixed extends Annotated {
    constructor(encoding, value) {
        super();
        this.encoding = getEncoding(encoding);
        this.value = value;
    }

    explain(value) {
        return `${this.value}`;
    }

    read(bufferReader, value) {
        let readValue= this.encoding.read(bufferReader, value);
        if (readValue != this.value) {
            throw new Error(`Unexpected value, read:${readValue}, expected: ${this.value}`);
        }
        return readValue;
    }
    write(bufferWriter, value) {
        this.encoding.write(bufferWriter, this.value);
    }
}

module.exports = (...args) => new Fixed(...args);
