const AnnotatedValue = require("../annotate/AnnotatedValue");

class U32 extends AnnotatedValue {
    read(bufferReader) {
        return bufferReader.readU32();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU32(value);
    }
}

module.exports = (...args) => new U32(...args);
