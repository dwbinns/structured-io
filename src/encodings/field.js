const Encoding = require("../Encoding");
const annotate = require("./annotate");

module.exports = function field(name, fieldDefinition) {
    let fieldEncoding = getEncoding(fieldDefinition);
    return annotate(`field: ${name}`, new class extends Encoding {
        read(bufferReader, context, value) {
            value[name] = fieldEncoding.read(bufferReader, context, value[name]);
            return value;
        }
        write(bufferWriter, context, value) {
            fieldEncoding.write(bufferWriter, context, value[name]);
        }
    });
};