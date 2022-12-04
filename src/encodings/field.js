import Annotated from "../annotate/Annotated.js";
import { wrap } from "../capture.js";
import getEncoding from "../getEncoding.js";

class Field extends Annotated {
    constructor(name, fieldDefinition) {
        super(`.${name}`);
        this.name = name;
        this.fieldEncoding = getEncoding(fieldDefinition);
    }


    read(bufferReader, value) {
        value[this.name] = this.fieldEncoding.read(bufferReader, value[this.name]);
        return value;
    }
    write(bufferWriter, value) {
        this.fieldEncoding.write(bufferWriter, value[this.name]);
    }

    explain(value) {
        return "";
    }

}

export default wrap((name, fieldDefinition) => new Field(name, fieldDefinition));