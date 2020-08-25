const AnnotatedValue = require("../annotate/AnnotatedValue");

class U16 extends AnnotatedValue {
    read(bufferReader) {
        return bufferReader.readU16();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU16(value);
    }
}

module.exports = (...args) => new U16(...args);
