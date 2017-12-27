const {BufferReader, BufferWriter} = require('buffer-io');
const {interpretEncoding} = require('./encodings');

function read(uint8array, context, specification) {
    let reader=new BufferReader(uint8array);
    return interpretEncoding(specification).read(reader, context);
}

function write(data, context, specification=data.constructor) {
    let writer=new BufferWriter();
    interpretEncoding(specification).write(writer, context, data);
    return writer.getUint8Array();
}

module.exports = Object.assign({
    PacketProcessor: require('./PacketProcessor'),
    read,
    write,
}, require('./encodings'));
