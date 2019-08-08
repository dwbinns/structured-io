const Encoding = require("./Encoding");

module.exports = {
    PacketProcessor: require("./PacketProcessor"),
    ...exceptionWrapAll({
        u8: require("./encodings/u8"),
        u16: require("./encodings/u16"),
        u24: require("./encodings/u24"),
        u32: require("./encodings/u32"),
        auto: require("./encodings/auto"),
        explain: require("./annotate/explain"),
        read: require("./read"), 
        write: require("./write"), 
        definition: require("./encodings/definition"),
        sequence: require("./encodings/sequence"),
        fields: require("./encodings/fields"),
        fixed: require("./encodings/fixed"),
        size: require("./encodings/size"),
        //sized: require("./encodings/sized"),
        type: require("./encodings/type"),
        //typed: require("./encodings/typed"),
        dynamic: require("./encodings/dynamic"),
        bytes: require("./encodings/bytes"),
        ofClass: require("./encodings/ofClass"),
        pad: require("./encodings/pad"),
        ignore: require("./encodings/ignore"),
        array: require("./encodings/array"),
        string: require("./encodings/string"),
        latin1: require("./encodings/latin1"),
        ascii: require("./encodings/ascii"),
        ...require("./encodings/configurations"),
    })
};

function getStackCodeLocation(stack, offset) {
    return stack.split("\n")[offset].replace(/.* \(?([^) ()]*)\)? */, "$1");
}

function exceptionWrap(fn) {
    function encoding(...args) {
        let capture = new Error("capture");
        let here = getStackCodeLocation(capture.stack, 1).split("/");
        let where = getStackCodeLocation(capture.stack, 2).split("/");
        let caller = where.slice(where.findIndex((component, index) => here[index] != component)).join("/");
        try {
            return fn(caller, ...args);
        } catch (e) {
            if (e instanceof Encoding.NotAnEncoding && !e.captured) {
                e.captured = true;
                Error.captureStackTrace(e, encoding);
            }
            throw e;
        }
    };
    return encoding;
}

function exceptionWrapAll(definitions) {
    let wrappedDefinitions = {};
    for (let [key, value] of Object.entries(definitions)) {
        wrappedDefinitions[key] = (typeof value == "function")
            ? exceptionWrap(value)
            : value;
    }
    return wrappedDefinitions;
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