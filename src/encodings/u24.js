const annotate = require("./annotate");
const Encoding = require("../Encoding");

module.exports = annotate(v => `u24BE: ${v}`, new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU24();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU24(value);
    }
});