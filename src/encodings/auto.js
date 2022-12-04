import Annotated from "../annotate/Annotated.js";
import { wrap } from "../capture.js";

class Auto extends Annotated {
    read(bufferReader, value) {
        value.constructor.encoding.read(bufferReader, value);
        return value;
    }
    write(bufferWriter, value) {
        value.constructor.encoding.write(bufferWriter, value);
    }
}

export default wrap(() => new Auto());
