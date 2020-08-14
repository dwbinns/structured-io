const Encoding = require("../Encoding");

module.exports = function dynamic(handler) {
    return new class extends Encoding {
        read(bufferReader, context, value) {
            return handler(value, context).read(bufferReader, context, value);
        }
        write(bufferWriter, context, value) {
            handler(value, context).write(bufferWriter, context, value);
        }
    };
}