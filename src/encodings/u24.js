import AnnotatedValue from "../annotate/AnnotatedValue.js";
import { wrap } from "../capture.js";

class U24 extends AnnotatedValue {
    read(bufferReader) {
        return bufferReader.readU24();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU24(value);
    }

}

export default wrap((...args) => new U24(...args));

