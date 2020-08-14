const Encoding = require("../Encoding");
const annotate = require("./annotate");

module.exports = function field(name, encoding) {
    Encoding.check(encoding);
    return annotate(`field: ${name}`, new class extends Encoding {
        read(bufferReader, context, value) {
            value[name] = encoding.read(bufferReader, context, value[name]);
            return value;
        }
        write(bufferWriter, context, value) {
            encoding.write(bufferWriter, context, value[name]);
        }
    });
};