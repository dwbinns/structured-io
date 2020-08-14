const Encoding = require("../Encoding");
const annotate = require("../annotate");
const getEncoding = require("../getEncoding");

class Dynamic extends Encoding {
    constructor(encodingFactory) {
        super();
        this.encodingFactory = encodingFactory;
    }

    read(bufferReader, context, value) {
        getEncoding(this.encodingFactory(value, context)).read(bufferReader, context, value);
        return value;
    }

    write(bufferWriter, context, value) {
        getEncoding(this.encodingFactory(value, context)).write(bufferWriter, context, value);
    }
}

module.exports = (encodingFactory) => new Dynamic(encodingFactory);