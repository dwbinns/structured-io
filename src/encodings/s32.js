import AnnotatedValue from "../annotate/AnnotatedValue.js";

class S32 extends AnnotatedValue {
    read(bufferReader) {
        return bufferReader.readS32();
    }
    write(bufferWriter, value) {
        bufferWriter.writeS32(value);
    }
}

export default (...args) => new S32(...args);
