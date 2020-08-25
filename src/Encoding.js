const { getLocation } = require("./capture");

class NotAnEncoding extends Error {
    constructor(message = "Not an Encoding") {
        super(message);
    }
}

class Encoding {
    read(bufferReader, value) {}
    write(bufferWriter, value) {}

    static check(encoding) {
        if (encoding instanceof Encoding) return encoding;
        throw new Encoding.NotAnEncoding();
    }

    static NotAnEncoding = NotAnEncoding;
}



module.exports = Encoding;
