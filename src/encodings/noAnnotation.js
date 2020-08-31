const AnnotateContext = require("../annotate/AnnotateContext");
const Encoding = require("../Encoding");

class NoAnnotation extends Encoding {
    constructor(content) {
        super();
        this.contentEncoding = Encoding.check(content);
    }
    read(bufferReader, value) {
        return bufferReader.nest(reader => this.contentEncoding.read(reader.setContext(AnnotateContext.symbol, null), value));
    }
    write(bufferWriter, value) {
        this.encoding.write(bufferWriter, value);
    }
}

module.exports = (content) => new NoAnnotation(content);