const Encoding = require("../Encoding");
const getEncoding = require("../getEncoding");

class Optional extends Encoding {
    constructor(defaultValue, content) {
        super();
        this.defaultValue = defaultValue;
        this.contentEncoding = getEncoding(content);
    }

    read(bufferReader, value) {
        let subReader = bufferReader.here();
        try {
            let result = this.contentEncoding.read(subReader, value);
            bufferReader.eat(subReader.getReadSize());
            return result;
        } catch (e) {
            return this.defaultValue;
        }

    }
    write(bufferWriter, value) {
        if (value === this.defaultValue) return;
        this.contentEncoding.write(bufferWriter, value);
    }
}

module.exports = (defaultValue, contentEncoding) => new Optional(defaultValue, contentEncoding);