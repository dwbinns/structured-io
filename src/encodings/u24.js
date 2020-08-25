const AnnotatedValue = require("../annotate/AnnotatedValue");

class U24 extends AnnotatedValue {
    read(bufferReader) {
        return bufferReader.readU24();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU24(value);
    }

}

module.exports = (...args) => new U24(...args);

