const Encoding = require("../Encoding");

module.exports = function sequence(...componentEncodings) {
    componentEncodings.forEach(Encoding.check);
    return new class SequenceEncoding extends Encoding {
        read(bufferReader, context, value) {
            let result;
            for (let encoding of componentEncodings) {
                result = encoding.read(bufferReader, context, value);
            }
            return result;
        }
        write(bufferWriter, context, value) {
            for (let encoding of componentEncodings) {
                encoding.write(bufferWriter, context, value);
            }
        }
    };
}
