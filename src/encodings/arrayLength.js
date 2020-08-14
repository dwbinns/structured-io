const Encoding = require("../Encoding");

function arrayLength(contentSpecification) {
    let contentEncoding = interpretEncoding(contentSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            value = new Array(contentEncoding.read(bufferReader, context)).fill(null);
            return value;
        }
        write(bufferWriter, context, value) {
            contentEncoding.write(bufferWriter, context, value.length);
        }
    };
}
exports.arrayLength = arrayLength;
