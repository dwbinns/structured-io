import Annotated from "../annotate/Annotated.js";
import { wrap } from "../capture.js";

class U64bigint extends Annotated {
    read(bufferReader) {
        return bufferReader.readU64big();
    }
    write(bufferWriter, value) {
        bufferWriter.writeU64big(value);
    }
}

export default wrap(() => new U64bigint());