const Encoding = require("../Encoding");

class String extends Encoding {
    constructor(encoding = "utf8", size) {
        super(`string(${encoding})`);
        this.encoding = encoding;
        this.size = size;
    }

    read(bufferReader, value) {
        return Buffer.from(bufferReader.readBytes(this.size)).toString(this.encoding);
    }
    write(bufferWriter, value) {
        //console.log("writebytes",value.length,size);
        // @ts-ignore
        let buffer = Buffer.from(value, this.encoding);
        bufferWriter.writeBytes(this.size ? buffer.slice(0, this.size) : buffer);
        if (this.size > buffer.length) bufferWriter.skip(this.size - buffer.length);
    }
}

module.exports = (...args) => new String(...args);

