const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Configure extends Encoding {
    constructor(configuration, contentEncoding) {
        super();
        this.configuration = configuration;
        this.contentEncoding = Encoding.get(contentEncoding);
    }


    read(bufferReader, context, value) {
        let subReader = bufferReader.subReader().configure(this.configuration);
        value = this.contentEncoding.read(subReader, context, value);
        bufferReader.eat(subReader.getReadSize());
        return value;
    }
    write(bufferWriter, context, value) {
        let nestedWriter = bufferWriter.nestedWriter().configure(this.configuration);
        this.contentEncoding.write(nestedWriter, context, value);
        bufferWriter.skip(nestedWriter.getSize());
    }
}

module.exports = (configuration) =>
    (where, contentEncoding) => new Configure(configuration, contentEncoding);
