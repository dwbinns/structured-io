const Encoding = require("../Encoding");

class Configure extends Encoding {
    constructor(configuration, contentEncoding) {
        super();
        this.configuration = configuration;
        this.contentEncoding = Encoding.get(contentEncoding);
    }


    read(bufferReader, value) {
        let subReader = bufferReader.here().configure(this.configuration);
        value = this.contentEncoding.read(subReader, value);
        bufferReader.eat(subReader.getReadSize());
        return value;
    }
    write(bufferWriter, value) {
        let nestedWriter = bufferWriter.here().configure(this.configuration);
        this.contentEncoding.write(nestedWriter, value);
        bufferWriter.skip(nestedWriter.getSize());
    }
}

module.exports = (configuration) =>
    (where, contentEncoding) => new Configure(configuration, contentEncoding);
