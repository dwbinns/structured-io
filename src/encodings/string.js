import AnnotatedValue from "../annotate/AnnotatedValue.js";
import { wrap } from "../capture.js";

class String extends AnnotatedValue {
    constructor(encoding = "utf8", size) {
        super(`string(${encoding})`);
        this.encoding = encoding;
        this.size = size;
    }

    read(bufferReader, value) {
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

export default wrap((...args) => new String(...args));

