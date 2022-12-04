import Encoding from "../Encoding.js";

export default function transform(innerEncoding, read, write) {

    return new class extends Encoding {
        read(bufferReader) {
            return read(innerEncoding.read(bufferReader));
        }
        write(bufferWriter, value) {
            innerEncoding.write(bufferWriter, write(value));
        }
    };
};
