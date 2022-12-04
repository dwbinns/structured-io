import Encoding from "../Encoding.js";

class Call extends Encoding {
    constructor(handler) {
        super()
        this.handler = handler;
    }
    read(bufferReader, value) {
        this.handler(value, bufferReader.context);
        return value;
    }
    write(bufferWriter, value) {
        this.handler(value, bufferWriter.context);
    }
}

export default (...args) => new Call(...args);