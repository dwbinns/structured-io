const Encoding = require("../Encoding");
const annotate = require("../annotate");

class U32 extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU32();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU32(value);
    }
}

module.exports = annotate(v => `u32: ${v}`, U32);
