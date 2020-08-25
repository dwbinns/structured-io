const AnnotatedValue = require("../annotate/AnnotatedValue");

class U8 extends AnnotatedValue {
    read(bufferReader) {
        return bufferReader.readU8();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU8(value);
    }
}

module.exports = (...args) => new U8(...args);
