const Encoding = require("../Encoding");
const alternative = require("./alternative");
const annotate = require("./annotate");

module.exports = function type(typeFieldEncoding, options, fieldEncoding) {
    let typeEncoding = alternative(typeFieldEncoding, options);


    return annotate(v => `type: ${v ? v.constructor.name : "-"}`, new class extends Encoding {
        read(bufferReader, context, value) {
            let result = new (typeEncoding.read(bufferReader, context))();
            if (fieldEncoding) return fieldEncoding.read(bufferReader, context, result);
            return result;
        }
        write(bufferWriter, context, value) {
            typeEncoding.write(bufferWriter, context, value.constructor);
            if (fieldEncoding) fieldEncoding.write(bufferWriter, context, value);
        }

    });
}
