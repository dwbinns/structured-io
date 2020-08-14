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
            Encoding.check(factory(collector)).read(bufferReader, context, value);
            return result;
        }
        write(bufferWriter, context, value) {
            Encoding.check(factory(resultEncoding => Encoding.check(resultEncoding))).write(bufferWriter, context, value);
        }
    };
}

