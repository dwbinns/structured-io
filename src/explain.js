const { BufferReader } = require('buffer-io');
const AnnotateContext = require('./annotate/AnnotateContext');
const { getLocation } = require('./capture');
const getEncoding = require('./getEncoding');


module.exports = function explain(uint8array, specification) {
    let reader = new BufferReader(uint8array);
    let context = new AnnotateContext(reader, 'explain', getLocation());
    reader.setContext(AnnotateContext.symbol, context);

    let encoding = getEncoding(specification);
    try {
        encoding.read(reader, context);
    } finally {
        context.finish();
        console.log(context.toTree().renderLines().join("\n"));
    }
}
