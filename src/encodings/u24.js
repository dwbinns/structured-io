const Encoding = require("../Encoding");
const annotate = require("../annotate");

class U24 extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU24();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU24(value);
    }

}

module.exports = annotate(v => `u24: ${v}`, U24);

