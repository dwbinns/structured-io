const {BufferReader, BufferWriter} = require('buffer-io');

function write(where, data, encoding = data.constructor.encoding, context) {
    let writer=new BufferWriter();
    
    encoding.write(writer, context, data);
    return writer.getUint8Array();
}

module.exports = write;