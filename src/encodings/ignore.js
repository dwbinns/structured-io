import Annotated from "../annotate/Annotated.js";

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

export default (...args) => new Ignore(...args);
