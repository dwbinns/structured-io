const Encoding = require("../Encoding");

class Call extends Encoding {
    constructor(handler) {
        super()
        this.handler = handler;
    }
    read(bufferReader, value) {
        this.handler(value, bufferReader.context);
        return value;
    }
    write(bufferWriter, value) {
        this.handler(value, bufferWriter.context);
    }
}

module.exports = (...args) => new Call(...args);