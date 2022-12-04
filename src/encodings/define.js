import Encoding from "../Encoding.js";
import Definition from "../definitions/Definition.js";
import { getLocation } from '../capture.js';

class Define extends Encoding {
    constructor(factory) {
        super();
        this.factory = factory;
        this.location = getLocation();
    }

    makeContent() {
        return this.factory(
            ...new Array(this.factory.length).fill(0).map((_, index) => new Definition(this.location, index))
        );
    }

    read(bufferReader, value) {
        return this.makeContent().read(bufferReader, value);
    }

    write(bufferWriter, value) {
        this.makeContent().write(bufferWriter, value);
    }
}

export default (...args) => new Define(...args);
