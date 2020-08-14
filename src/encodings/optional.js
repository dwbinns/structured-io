const Encoding = require("../Encoding");

class Optional extends Encoding {
    constructor(defaultValue, content) {
        super();
        this.defaultValue = defaultValue;
        this.contentEncoding = getEncoding(content);
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