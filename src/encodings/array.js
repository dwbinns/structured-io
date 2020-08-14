const ScopeFactory = require("../definitions/ScopeFactory");
const Encoding = require("../Encoding");
const annotate = require("../annotate");

class ArrayIO {
    constructor(a1, a2) {
        let [size, content] = a2 ? [a1, a2] : [, a1];

        this.contentEncoding = Encoding.get(content);
        this.size = size && new ScopeFactory(size);

    }

    read(bufferReader, context, value) {
        if (!this.size) {
            value = [];
            while (!bufferReader.eof()) {
                value.push(this.contentEncoding.read(bufferReader, context));
            }
        } else {
            let sizeScope = this.size.getReadScope(bufferReader, context);
            value = new Array(sizeScope.get()).fill(0);
            value.forEach((v, i) => value[i] = this.contentEncoding.read(bufferReader, context, v));
        }
        return value;
    }
    write(bufferWriter, context, value) {
        if (this.size) {
            let sizeScope = this.size.getWriteScope(bufferWriter, context);
            sizeScope.set(value.length);
        }
        for (let item of value) {
            this.contentEncoding.write(bufferWriter, context, item);
        }
    }

}

module.exports = annotate(v => `array`, ArrayIO);
