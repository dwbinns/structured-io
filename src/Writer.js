import write from "./write.js";

export default class Writer {
    constructor(stream) {
        this.stream = stream;
    }

    write(data, encoding) {
        this.stream.write(write(data, encoding));
    }
}