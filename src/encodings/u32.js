import AnnotatedValue from "../annotate/AnnotatedValue.js";

class U32 extends AnnotatedValue {
    read(bufferReader) {
        return bufferReader.readU32();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU32(value);
    }
}

export default (...args) => new U32(...args);
