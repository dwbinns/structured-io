const annotate = require("./annotate");
const Encoding = require("../Encoding");

module.exports = annotate(v => `${v.constructor.name}`, new class extends Encoding {
    read(bufferReader, context, value) {
        value.constructor.encoding.read(bufferReader, context, value);
        return value;
    }
    write(bufferWriter, context, value) {
        value.constructor.encoding.write(bufferWriter, context, value);
    }
});