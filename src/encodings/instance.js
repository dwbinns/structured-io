
const Encoding = require("../Encoding");


module.exports = function instance(classType, encoding = classType.encoding) {
    if (!(encoding instanceof Encoding)) throw new Encoding.NotAnEncoding();

    return new class extends Encoding {
        read(bufferReader, context, value) {
            return encoding.read(bufferReader, context, new classType());
        }
        write(bufferWriter, context, value) {
            encoding.write(bufferWriter, context, value);
        }
    };
};
