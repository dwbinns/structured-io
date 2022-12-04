import AnnotatedValue from "../annotate/AnnotatedValue.js";
import { wrap } from "../capture.js";

class Line extends AnnotatedValue {
    constructor(encoding = "utf8", terminal) {
        super(`string(${encoding})`);
        this.encoding = encoding;
        this.terminal = terminal;
    }

    read(bufferReader) {
        return Buffer.from(bufferReader.readBytes(this.size)).toString(this.encoding);
    }
    write(bufferWriter, value) {
        
        // @ts-ignore
        let buffer = Buffer.from(value, this.encoding);
        //console.log("writebytes", value.length, this.size, this.size ? buffer.slice(0, this.size) : buffer);
        bufferWriter.writeBytes(this.size ? buffer.slice(0, this.size) : buffer);
        if (this.size > buffer.length) bufferWriter.skip(this.size - buffer.length);
    }
}

export default wrap((...args) => new Line(...args));

