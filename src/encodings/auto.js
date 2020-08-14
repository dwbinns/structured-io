const Encoding = require("../Encoding");
const annotate = require("../annotate");


class Auto extends Encoding {
    read(bufferReader, context, value) {
        value.constructor.encoding.read(bufferReader, context, value);
        return value;
    }
    write(bufferWriter, context, value) {
        value.constructor.encoding.write(bufferWriter, context, value);
    }
}

module.exports = annotate(v => `auto: ${v.constructor.name}`, Auto);
