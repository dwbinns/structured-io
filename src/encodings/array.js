const getEncoding = require("../getEncoding");
const Definition = require("../definitions/Definition");
const Annotated = require("../annotate/Annotated");

class ArrayEncoding extends Annotated {
    constructor(size, content) {
        super();

        this.contentEncoding = getEncoding(content);
        this.size = size;

    }

    read(bufferReader, value) {
        if (!this.size) {
            value = [];
            while (!bufferReader.eof()) {
                value.push(this.contentEncoding.read(bufferReader));
            }
        } else {
            let size = Definition.read(this.size, bufferReader);
            value = new Array(size.get()).fill(0);
            value.forEach((v, i) => value[i] = this.contentEncoding.read(bufferReader, v));
        }
        return value;
    }
    write(bufferWriter, value) {
        if (this.size) {
            let size = Definition.write(this.size, bufferWriter);
            size.set(value.length);
        }
        for (let item of value) {
            this.contentEncoding.write(bufferWriter, item);
        }
    }

}

module.exports = (a1, a2) => a2
    ? new ArrayEncoding(a1, a2)
    : new ArrayEncoding(null, a1);
