import Encoding from "../Encoding.js";

class OnRead extends Encoding {
    constructor(callback) {
        super();
        this.callback = callback;
    }

    read(bufferReader, value) {
        return this.callback(bufferReader, value);
    }

    write(bufferWriter, value) {
        return value;
    }
}

export default (callback) => new OnRead(callback);