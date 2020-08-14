const Encoding = require("../Encoding");

module.exports = function transform(innerEncoding, read, write) {

    return new class extends Encoding {
        read(bufferReader, context, value) {
            return read(innerEncoding.read(bufferReader, context));
        }
        write(bufferWriter, context, value) {
            innerEncoding.write(bufferWriter, context, write(value));
        }
    };
};
