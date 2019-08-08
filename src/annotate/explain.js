const AnnotateContext = require("./AnnotateContext");
const ofClass = require('../encodings/ofClass');
const Encoding = require("../Encoding");
const BufferReader = require("buffer-io/src/BufferReader");

function explain(where, uint8array, target) {
    let encoding = Encoding.get(target);
    
    let reader=new BufferReader(uint8array);
    let context = new AnnotateContext(reader);
    encoding.read(reader, context);
    return context.toText();
}

module.exports = explain;
