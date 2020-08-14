const Annotator = require("../annotate/Annotator");
const Encoding = require("../Encoding");
const getEncoding = require("../getEncoding");

class Fields extends Encoding {
    constructor(definitions) {
        super();
        this.definitions = Object.entries(definitions)
            .map(([fieldName, encoding]) => [
                fieldName,
                new Annotator(() => `.${fieldName}`, getEncoding(encoding))
            ]);
    }

    read(bufferReader, context, value) {
        this.definitions.forEach(
            // @ts-ignore
            ([name, encoding]) => value[name] = encoding.read(bufferReader, context, value[name])
        );
        return value;
    }
    write(bufferWriter, context, value) {
        this.definitions.forEach(
            // @ts-ignore
            ([name, encoding]) => encoding.write(bufferWriter, context, value[name])
        );
    }

}

module.exports = (definitions) => new Fields(definitions);
