const Encoding = require("../Encoding");
const annotate = require("../annotate");

class U8 extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU8();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU8(value);
    }
}

module.exports = annotate(v => `u8: ${v}`, U8);
