import AnnotateContext from "../annotate/AnnotateContext.js";
import Encoding from "../Encoding.js";

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

export default (content) => new NoAnnotation(content);