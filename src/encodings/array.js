const Encoding = require("../Encoding");
const annotate = require("./annotate");

module.exports = function array(contentEncoding, fixedSize) {
    Encoding.check(contentEncoding);
    return annotate(`item of array`, new class extends Encoding {
        read(bufferReader, context, value) {
            if (!fixedSize) {
                value = [];
                while (!bufferReader.eof()) {
                    value.push(contentEncoding.read(bufferReader, context));
                }
            } else {
                value.forEach((v, i) => value[i] = contentEncoding.read(bufferReader, context, v));
            }
            return value;
        }
        write(bufferWriter, context, value) {
            for (let item of value) {
                contentEncoding.write(bufferWriter, context, item);
            }
        }
    });
}
