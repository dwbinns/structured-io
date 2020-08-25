const Annotated = require("../annotate/Annotated");

class Ignore extends Annotated {
    constructor(size) {
        super(`ignore: ${size}`);
        this.size = size;
    }
    explain() {return "";}

    read(bufferReader, value) {
        bufferReader.eat(this.size);
        return value;
    }
    write(bufferWriter, value) {
        bufferWriter.skip(this.size);
    }
}

module.exports = (...args) => new Ignore(...args);
