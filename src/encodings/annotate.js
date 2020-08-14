const AnnotateContext = require("../AnnotateContext");
const Encoding = require("../Encoding");
const getEncoding = require("../getEncoding");


module.exports = function annotate(annotator, content) {
    let contentEncoding = getEncoding(content);
    let annotation = typeof annotator == "string" ? annotator : "";
    if (!(annotation || typeof annotator == "function")) throw new Error("annotate either a string or a function");
    return new class extends Encoding {
        read(bufferReader, context, value) {

            try {

                if (context instanceof AnnotateContext) {

                    let nestedContext = context.child(bufferReader, annotation);
                    let result = contentEncoding.read(bufferReader, nestedContext, value);
                    nestedContext.finish(annotation || annotator(result));
                    return result;
                }
                return contentEncoding.read(bufferReader, context, value);

            } catch (e) {
                e.stack += `\nIn: ${annotation || annotator(value)}`;
                throw e;
            }
        }
        write(bufferWriter, context, value) {
            try {
                contentEncoding.write(bufferWriter, context, value);
            } catch (e) {
                e.stack += `\nIn: ${annotation || annotator(value)}`;
                throw e;
            }
        }
    };
}
