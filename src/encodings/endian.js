import Encoding from "../Encoding.js";
import getEncoding from "../getEncoding.js";

class Endian extends Encoding {
    constructor(littleEndian, contentEncoding) {
        super();
        this.littleEndian = littleEndian;
        this.contentEncoding = getEncoding(contentEncoding);
    }

    read(bufferReader, value) {
        let reader = bufferReader.here().configure({littleEndian: this.littleEndian});
        value = this.contentEncoding.read(reader, value);
        bufferReader.eat(reader.getReadSize());
        return value;
    }
    write(bufferWriter, value) {
        let writer = bufferWriter.here().configure({littleEndian: this.littleEndian});
        this.contentEncoding.write(writer, value);
        bufferWriter.skip(writer.getSize());
    }
}


export default (littleEndian, contentEncoding) => new Endian(littleEndian, contentEncoding);