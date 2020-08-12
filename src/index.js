const Encoding = require("./Encoding");

module.exports = {
    PacketProcessor: require("./PacketProcessor"),
    
    u8: wrap(require("./encodings/u8")),
    u16: wrap(require("./encodings/u16")),
    u24: wrap(require("./encodings/u24")),
    u32: wrap(require("./encodings/u32")),
    auto: wrap(require("./encodings/auto")),
    explain: wrap(require("./annotate/explain")),
    read: wrap(require("./read")), 
    write: wrap(require("./write")), 
    definition: wrap(require("./encodings/definition")),
    sequence: wrap(require("./encodings/sequence")),
    condition: wrap(require("./encodings/condition")),
    bitSet: wrap(require("./encodings/bitSet")),
    fields: wrap(require("./encodings/fields")),
    fixed: wrap(require("./encodings/fixed")),
    size: wrap(require("./encodings/size")),
    //sized: wrap(require("./encodings/sized")),
    type: wrap(require("./encodings/type")),
    //typed: wrap(require("./encodings/typed")),
    dynamic: wrap(require("./encodings/dynamic")),
    bytes: wrap(require("./encodings/bytes")),
    ofClass: wrap(require("./encodings/ofClass")),
    pad: wrap(require("./encodings/pad")),
    ignore: wrap(require("./encodings/ignore")),
    array: wrap(require("./encodings/array")),
    string: wrap(require("./encodings/string")),
    latin1: wrap(require("./encodings/latin1")),
    ascii: wrap(require("./encodings/ascii")),
    bigEndian: wrap(require("./encodings/configure")({littleEndian: false})),
    littleEndian: wrap(require("./encodings/configure")({littleEndian: true})),
};

function getStackCodeLocation(stack, offset) {
    return stack.split("\n")[offset].replace(/.* \(?([^) ()]*)\)? */, "$1");
}

function wrap(fn) {
    function wrapped(...args) {
        let capture = new Error("capture");
        let here = getStackCodeLocation(capture.stack, 1).split("/");
        let where = getStackCodeLocation(capture.stack, 2).split("/");
        let caller = where.slice(where.findIndex((component, index) => here[index] != component)).join("/");
        try {
            return fn(caller, ...args);
        } catch (e) {
            if (e instanceof Encoding.NotAnEncoding && !e.captured) {
                e.captured = true;
                Error.captureStackTrace(e, wrapped);
            }
            throw e;
        }
    };
    return wrapped;
}



/*const {BufferReader, BufferWriter} = require('buffer-io');
const {interpretEncoding, AnnotateContext} = require('./encodings');

function read(uint8array, context, specification) {
    let reader=new BufferReader(uint8array);
    return interpretEncoding(specification).read(reader, context);
}

function write(data, context, specification=data.constructor) {
    let writer=new BufferWriter();
    interpretEncoding(specification).write(writer, context, data);
    return writer.getUint8Array();
}

function explain(uint8array, specification) {
    let reader=new BufferReader(uint8array);
    let context = new AnnotateContext(reader);
    interpretEncoding(specification).read(reader, context);
    context.print();
}

module.exports = Object.assign({
    PacketProcessor: require('./PacketProcessor'),
    explain,
    read,
    write,
}, require('./encodings'));
*/