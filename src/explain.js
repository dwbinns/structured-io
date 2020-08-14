const { BufferReader } = require('buffer-io');
const AnnotateContext = require('./AnnotateContext');
const getEncoding = require('./getEncoding');


module.exports = function explain(uint8array, specification) {
    let reader = new BufferReader(uint8array);
    let context = new AnnotateContext(reader);

    let encoding = getEncoding(specification);
    try {
        encoding.read(reader, context);
    } finally {
        context.finish("");
        console.log(context.toTree().renderLines().join("\n"));
    }
}
