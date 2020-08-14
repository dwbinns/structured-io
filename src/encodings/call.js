const Encoding = require("../Encoding");

module.exports = function call(handler) {
    return new class extends Encoding {
        read(bufferReader, context, value) {
            handler(value, context);
            return value;
        }
        write(bufferWriter, context, value) {
            handler(value, context);
        }
    };
}