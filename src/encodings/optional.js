const Encoding = require("../Encoding");

class Optional extends Encoding {
    constructor(defaultValue, contentEncoding) {
        super();
        Encoding.check(contentEncoding);
        this.defaultValue = defaultValue;
        this.contentEncoding = contentEncoding;
    }

    read(bufferReader, context, value) {
        let subReader = bufferReader.subReader();
        try {
            let result = this.contentEncoding.read(subReader, context, value);
            bufferReader.eat(subReader.getReadSize());
            return result;
        } catch (e) {
            return this.defaultValue;
        }

    }
    write(bufferWriter, context, value) {
        if (value === this.defaultValue) return;
        this.contentEncoding.write(bufferWriter, context, value);
    }
}

module.exports = (defaultValue, contentEncoding) => new Optional(defaultValue, contentEncoding);