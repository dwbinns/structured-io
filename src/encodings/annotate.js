const AnnotateContext = require("../AnnotateContext");
const Encoding = require("../Encoding");


module.exports = function annotate(annotator, content) {
    Encoding.check(content);
    let annotation = typeof annotator == "string" ? annotator : "";
    if (!(annotation || typeof annotator == "function")) throw new Error("annotate either a string or a function");
    return new class extends Encoding {
        read(bufferReader, context, value) {

            try {

                if (context instanceof AnnotateContext) {

                    let nestedContext = context.child(bufferReader, annotation);
                    let result = content.read(bufferReader, nestedContext, value);
                    nestedContext.finish(annotation || annotator(result));
                    return result;
                }
                return content.read(bufferReader, context, value);

            } catch (e) {
                e.stack += `\nIn: ${annotation || annotator(value)}`;
                throw e;
            }
        }
        write(bufferWriter, context, value) {
            try {
                content.write(bufferWriter, context, value);
            } catch (e) {
                e.stack += `\nIn: ${annotation || annotator(value)}`;
                throw e;
            }
        }
    };
}
