import Annotated from "../annotate/Annotated.js";
import { wrap } from "../capture.js";

class Bytes extends Annotated {
    constructor(size) {
        super();
        this.size = size;
    }

    explain(value) {
        return `[${value.length}]`;
    }

    read(bufferReader, value) {
        return bufferReader.readBytes(this.size);
    }
    write(bufferWriter, value) {
        bufferWriter.writeBytes(this.size ? value.slice(0, this.size) : value);
        if (this.size > value.length) bufferWriter.skip(this.size - value.length);
    }
}

export default wrap(size => new Bytes(size));
