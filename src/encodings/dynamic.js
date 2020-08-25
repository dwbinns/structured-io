const Encoding = require("../Encoding");
const annotate = require("../annotate");
const getEncoding = require("../getEncoding");

class Dynamic extends Encoding {
    constructor(encodingFactory) {
        super();
        this.encodingFactory = encodingFactory;
    }

    read(bufferReader, value) {
        getEncoding(this.encodingFactory(value)).read(bufferReader, value);
        return value;
    }

    write(bufferWriter, value) {
        getEncoding(this.encodingFactory(value)).write(bufferWriter, value);
    }
}

module.exports = (encodingFactory) => new Dynamic(encodingFactory);