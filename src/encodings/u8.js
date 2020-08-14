const annotate = require("./annotate");
const Encoding = require("../Encoding");

module.exports = annotate(v => `u8: ${v}`, new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU8();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU8(value);
    }
});
