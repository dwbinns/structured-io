const Encoding = require("../Encoding");
const annotate = require("../annotate");

class U16 extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU16();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU16(value);
    }
}

module.exports = annotate(v => `u16: ${v}`, U16);
