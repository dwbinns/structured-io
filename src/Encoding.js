class NotAnEncoding extends Error {
    constructor(message = "Not an Encoding") {
        super(message);
        this.captured = false;
    }
}

class Encoding {
    read(bufferReader, context, value) {}
    write(bufferWriter, context, value) {}

    static NotAnEncoding = NotAnEncoding;
}



module.exports = Encoding;
