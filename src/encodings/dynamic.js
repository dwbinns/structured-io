import Encoding from "../Encoding.js";
import getEncoding from "../getEncoding.js";

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

export default (encodingFactory) => new Dynamic(encodingFactory);