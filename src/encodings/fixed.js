const annotate = require("./annotate");
const Encoding = require("../Encoding");

module.exports = function fixed(encoding, fixedValue) {

    return annotate(v => `fixed(${fixedValue})`, new class extends Encoding {
        read(bufferReader, context, value) {
            let readValue = encoding.read(bufferReader, context, value);
            if (readValue != fixedValue) {
                throw new Error(`Unexpected value, read:${readValue}, expected: ${fixedValue}`);
            }
            return readValue;
        }
        write(bufferWriter, context, value) {
            encoding.write(bufferWriter, context, fixedValue);
        }
    });
}