import Encoding from "../Encoding.js";
import getEncoding from "../getEncoding.js";

class Sequence extends Encoding {
    constructor(components) {
        super();

        this.components = components.map(getEncoding);
    }

    read(bufferReader, value) {
        this.components.forEach(type => type.read(bufferReader, value));
        return value;
    }

    write(bufferWriter, value) {
        for (let type of this.components) {
            type.write(bufferWriter, value);
        }
    }
}

export default (...components) => new Sequence(components);
