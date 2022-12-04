import Annotated from "../annotate/Annotated.js";
import { wrap } from "../capture.js";
import getEncoding from "../getEncoding.js";

class Fixed extends Annotated {
    constructor(encoding, value) {
        super();
        this.encoding = getEncoding(encoding);
        this.value = value;
    }

    explain(value) {
        return `${this.value}`;
    }

    read(bufferReader, value) {
        let readValue= this.encoding.read(bufferReader, value);
        if (readValue != this.value) {
            throw new Error(`Unexpected value, read:${readValue}, expected: ${this.value}`);
        }
        return readValue;
    }
    write(bufferWriter, value) {
        this.encoding.write(bufferWriter, this.value);
    }
}

export default wrap((...args) => new Fixed(...args));
