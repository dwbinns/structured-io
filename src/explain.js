const { BufferReader } = require('buffer-io');
const AnnotateContext = require('./annotate/AnnotateContext');
const { getLocation } = require('./capture');
const getEncoding = require('./getEncoding');


module.exports = function explain(uint8array, specification, parentContext) {
    let reader = new BufferReader(uint8array);
    let context = parentContext || new AnnotateContext();
    let node = context.child(reader, "explain", getLocation());
    reader.setContext(AnnotateContext.symbol, context);

    let encoding = getEncoding(specification);
    try {
        encoding.read(reader);
    } catch(e) {
        console.log(e);
    } finally {
        context.finish('explain', node);
        if (!parentContext) console.log(context.toTree().renderLines().join("\n"));
    }
}
