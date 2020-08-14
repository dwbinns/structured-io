const annotate = require("./annotate");
const Encoding = require("../Encoding");

module.exports = function instance(classType, encoding = classType.encoding) {
    Encoding.check(encoding);
    return annotate(`object ${classType.name}`, new class extends Encoding {
        read(bufferReader, context, value) {
            return encoding.read(bufferReader, context, new classType());
        }
        write(bufferWriter, context, value) {
            encoding.write(bufferWriter, context, value);
        }
    });
};
