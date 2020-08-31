const Annotated = require("../annotate/Annotated");

class Auto extends Annotated {
    read(bufferReader, value) {
        value.constructor.encoding.read(bufferReader, value);
        return value;
    }
    write(bufferWriter, value) {
        value.constructor.encoding.write(bufferWriter, value);
    }
}

module.exports = () => new Auto();
