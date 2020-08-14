const Encoding = require("../Encoding");
const annotate = require("./annotate");

module.exports = annotate(v => `u32: ${v}`, new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU32();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU32(value);
    }
});
