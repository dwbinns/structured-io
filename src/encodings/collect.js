const Encoding = require("../Encoding");

module.exports = function collect(factory) {
    return new class CollectEncoding extends Encoding {
        read(bufferReader, context, value) {
            let result;
            let collector = resultEncoding => new class extends Encoding {
                read(bufferReader, context, value) {
                    result = resultEncoding.read(bufferReader, context, value);
                }
            };
            getEncoding(factory(collector)).read(bufferReader, context, value);
            return result;
        }
        write(bufferWriter, context, value) {
            getEncoding(factory(resultEncoding => geEncoding(resultEncoding))).write(bufferWriter, context, value);
        }
    };
}

