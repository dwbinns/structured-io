const annotate = require("./annotate");
const Encoding = require("../Encoding");

module.exports = annotate(v => `u16: ${v}`, new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU16();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU16(value);
    }
});
