const { Encoding } = require("../Encoding");

function string(charset = "utf8") {
    return annotate(v => v, new class String extends Encoding {
        read(bufferReader, context, value) {
            return toBuffer(bufferReader.readBytes(size)).toString(charset);
        }
        write(bufferWriter, context, value) {
            let buffer = Buffer.from(value, "ascii");
            bufferWriter.writeBytes(buffer);
        }
    });
}
