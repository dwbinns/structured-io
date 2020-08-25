const Encoding = require("../Encoding");
const { getLocation } = require("../capture");
const AnnotateContext = require("./AnnotateContext");

class Annotated extends Encoding {
    constructor(name) {
        super();
        this.annotation = name || this.constructor.name;
        this.location = getLocation();
        let read = this.read;
        this.read = (bufferReader, value) => {
            try {
                let context = bufferReader.getContext(AnnotateContext.symbol);
                if (context) {
                    context.child(bufferReader, this.annotation, this.location);
                    let result = read.call(this, bufferReader, value);
                    context.finish(`${this.annotation} ${this.explain(result)}`);
                    return result;
                }
                return read.call(this, bufferReader, value);
            } catch (e) {
                e.stack += `\nIn: ${this.annotation} @ ${this.location}`;
                throw e;
            }
        };
        //Object.defineProperty(this.read, "name", {value: `read<${this.name}>\nfrom: ${this.location}>`});

        let write = this.write;
        this.write = (bufferWriter, value) => {
            try {
                write.call(this, bufferWriter, value);
            } catch (e) {
                e.stack += `\nIn: ${this.annotation} ${this.explain(value)} @ ${this.location}`;
                throw e;
            }
        }

        //Object.defineProperty(this.write, "name", {value: `write<${this.name}>\nfrom: ${this.location}`});
    }

    explain(value) {
        return value ? value.constructor.name : "";
    }
}

module.exports = Annotated;