const Annotated = require("../annotate/Annotated");

class U64bigint extends Annotated {
    read(bufferReader) {
        return bufferReader.readU64big();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU64big(value);
    }
}

module.exports = () => new U64bigint();