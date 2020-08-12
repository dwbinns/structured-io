const Encoding = require("../Encoding");
const annotate = require("../annotate");

class String extends Encoding {
    constructor(encoding = "utf8", size) {
        super();
        this.encoding = encoding;
        this.size = size;
    }

    read(bufferReader, context, value) {
        return Buffer.from(bufferReader.readBytes(this.size)).toString(this.encoding);
    }
    write(bufferWriter, context, value) {
        //console.log("writebytes",value.length,size);
        // @ts-ignore
        let buffer = Buffer.from(value, this.encoding);
        bufferWriter.writeBytes(this.size ? buffer.slice(0, this.size) : buffer);
        if (this.size > buffer.length) bufferWriter.skip(this.size - buffer.length);
    }
}

module.exports = annotate((s, encoding, size) => `string(${encoding}): ${s}`, String);
