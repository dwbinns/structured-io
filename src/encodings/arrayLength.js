import Encoding from "../Encoding.js";

function arrayLength(contentSpecification) {
    let contentEncoding = interpretEncoding(contentSpecification);
    return new class extends Encoding {
        read(bufferReader) {
            return new Array(contentEncoding.read(bufferReader)).fill(null);
        }
        write(bufferWriter, value) {
            contentEncoding.write(bufferWriter, value.length);
        }
    };
}
export default arrayLength;
