const Annotator = require("../annotate/Annotator");
const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Fields extends Encoding {
    constructor(where, definitions) {
        super();
        this.definitions = Object.entries(definitions).map(([fieldName, encoding]) => [fieldName, new Annotator(where, () => `.${fieldName}`, Encoding.get(encoding))]);
    }

    read(bufferReader, context, value) {
        this.definitions.forEach(
            ([name, encoding]) => value[name] = encoding.read(bufferReader, context, value[name])
        );
        return value;
    }
    write(bufferWriter, context, value) {
        this.definitions.forEach(
            ([name, encoding]) => encoding.write(bufferWriter, context, value[name])
        );
    }

}

module.exports = (where, definitions) => new Fields(where, definitions);
