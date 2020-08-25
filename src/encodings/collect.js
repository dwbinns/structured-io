const Encoding = require("../Encoding");

module.exports = function collect(factory) {
    return new class CollectEncoding extends Encoding {
        read(bufferReader, value) {
            let result;
            let collector = resultEncoding => new class extends Encoding {
                read(bufferReader, value) {
                    result = resultEncoding.read(bufferReader, value);
                }
            };
            getEncoding(factory(collector)).read(bufferReader, value);
            return result;
        }
        write(bufferWriter, value) {
            getEncoding(factory(resultEncoding => geEncoding(resultEncoding))).write(bufferWriter, value);
        }
    };
}

