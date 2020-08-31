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
            let context = bufferReader.getContext(AnnotateContext.symbol);
            if (!context) return read.call(this, bufferReader, value);

            let node = context.getCurrentNode();
            let annotationNode = context.child(bufferReader, this.annotation, this.location);
            try {

                let result = read.call(this, bufferReader, value);
                if (this.decode) this.decode(result, context);
                context.finish(`${this.annotation} ${this.explain(result)}`, annotationNode);
                return result;
            } catch (e) {
                //annotationNode.cancel();
                e.stack += `\nIn: ${this.annotation} @ ${this.location}`;
                throw e;
            } finally {
                if (context) context.restore(node);
            }
        };
        Object.defineProperty(this.read, "name", {value: `read<${name}>`});

        let write = this.write;
        this.write = (bufferWriter, value) => {
            try {
                write.call(this, bufferWriter, value);
            } catch (e) {
                e.stack += `\nIn: ${this.annotation} ${this.explain(value)} @ ${this.location}`;
                throw e;
            }
        }

        Object.defineProperty(this.write, "name", {value: `write<${name}>`});
    }

    explain(value) {
        return value ? value.constructor.name : "";
    }


    unannotate() {
        delete this.write;
        delete this.read;
        return this;
    }
}

module.exports = Annotated;