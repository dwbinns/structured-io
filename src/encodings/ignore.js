module.exports = function ignore(size) {
    return new class Bytes extends Encoding {
        read(bufferReader, context, value) {
            bufferReader.eat(size);
            return value;
        }
        write(bufferWriter, context, value) {
            bufferWriter.skip(size);
        }
    };
}
