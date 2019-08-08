const Encoding = require("../Encoding");
const AnnotateContext = require("./AnnotateContext");
    
class Annotator extends Encoding {
    constructor(where, annotator, content) {
        super();
        this.annotator = annotator;
        this.content = content;
        //Error.captureStackTrace(where);
        this.defined = where;
    }

    read(bufferReader, context, value) {
        try {

            if (context instanceof AnnotateContext) {
                let nestedContext = context.child(bufferReader);
                let result = this.content.read(bufferReader, nestedContext, value);
                nestedContext.end(this.annotator(result), this.defined);
                return result;
            }
            return this.content.read(bufferReader, context, value);

        } catch (e) {
            e.stack += `\nIn: ${this.annotator(value)}\n${this.defined}`;
            throw e;
        }
    }

    write(bufferWriter, context, value) {
        try {
            this.content.write(bufferWriter, context, value);
        } catch (e) {
            e.stack += `\nIn: ${this.annotator(value)}\n${this.defined}`;
            throw e;
        }
    }
}

module.exports = Annotator;