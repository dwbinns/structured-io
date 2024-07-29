import Encoding from "../Encoding.js";
import getEncoding from "../getEncoding.js";

class Chain extends Encoding {
    constructor(components) {
        super();

        this.components = components.map(getEncoding);
    }

    read(bufferReader, value) {
        return this.components.reduce((result, encoding) => encoding.read(bufferReader, result), value);
    }
    write(bufferWriter, value) {
        for (let encoding of this.components) {
            encoding.write(bufferWriter, value);
        }
    }
}

export default (...components) => new Chain(components);
