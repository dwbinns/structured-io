const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Dynamic extends Encoding {
    constructor(encodingFactory) {
        super();
        this.encodingFactory = encodingFactory;
    }

    read(bufferReader, context, value) {
        this.encodingFactory(value, context).read(bufferReader, context, value);
        return value;
    }

    write(bufferWriter, context, value) {
        this.encodingFactory(value, context).write(bufferWriter, context, value);
    }
}

module.exports = (where, encodingFactory) => new Dynamic(encodingFactory);
