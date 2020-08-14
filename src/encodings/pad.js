const { Encoding } = require("../Encoding");

function pad(padSize, contentSpecification) {
    let contentEncoding = interpretEncoding(contentSpecification);
    return annotate(v => `pad ${padSize}`, new class extends Encoding {
        read(bufferReader, context, value) {
            let nestedReader = bufferReader.subReader();
            value = contentEncoding.read(nestedReader, context, value);
            let readSize = nestedReader.getReadSize();
            bufferReader.eat(ceil(readSize / padSize) * padSize);
            return value;
        }
        write(bufferWriter, context, value) {
            let nestedWriter = bufferWriter.subWriter();
            contentEncoding.write(nestedWriter, context, value);
            let size = nestedWriter.getSize();
            bufferWriter.skip(ceil(size / padSize) * padSize);
        }
    });
}
