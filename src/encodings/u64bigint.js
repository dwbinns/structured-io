const Encoding = require("../Encoding");
const annotate = require("./annotate");

const u64bigint = annotate(v => `u64BE: ${v}`, new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU64big();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU64big(value);
    }
});

