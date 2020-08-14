const Encoding = require("../Encoding");
const annotate = require("./annotate");

module.exports = function bytes(size) {
    return annotate(`bytes`, new class Bytes extends Encoding {
        read(bufferReader, context, value) {
            return bufferReader.readBytes(size);
        }
        write(bufferWriter, context, value) {
            //console.log("writebytes",value.length,size);
            bufferWriter.writeBytes(size ? value.slice(0, size) : value);
            if (size > value.length)
                bufferWriter.skip(size - value.length);
        }
    });
}
