import AnnotatedValue from "../annotate/AnnotatedValue.js";
import { wrap } from "../capture.js";

class U8 extends AnnotatedValue {
    read(bufferReader) {
        return bufferReader.readU8();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU8(value);
    }
}

export default wrap((...args) => new U8(...args));
