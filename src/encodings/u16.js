import AnnotatedValue from "../annotate/AnnotatedValue.js";
import { wrap } from "../capture.js";

class U16 extends AnnotatedValue {
    read(bufferReader) {
        return bufferReader.readU16();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU16(value);
    }
}

export default wrap((...args) => new U16(...args));
