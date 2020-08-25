const Annotated = require("../annotate/Annotated");
const Annotator = require("../annotate/Annotator");
const Encoding = require("../Encoding");
const getEncoding = require("../getEncoding");

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

module.exports = (name, fieldDefinition) => new Field(name, fieldDefinition);