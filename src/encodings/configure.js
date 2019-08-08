const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Configure extends Encoding {
    constructor(configuration, contentEncoding) {
        super();
        this.configuration = configuration;
        this.contentEncoding = Encoding.get(contentEncoding);
    }


    read(bufferReader, context, value) {
        let nestedReader = bufferReader.nestedReader().configure(this.configuration);
        value = this.contentEncoding.read(nestedReader, context, value);
        bufferReader.eat(nestedReader.getReadSize());
        return value;
    }
    write(bufferWriter, context, value) {
        let nestedWriter = bufferWriter.nestedWriter().configure(this.configuration);
        this.contentEncoding.write(nestedWriter, context, value);
        bufferWriter.skip(nestedWriter.getSize());
    }
}

module.exports = (where, ...args) => new Configure(...args);
