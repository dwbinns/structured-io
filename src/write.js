const { BufferWriter } = require('buffer-io');
const auto = require('./encodings/auto');
const instance = require('./encodings/instance');

module.exports = function write(data, context, encoding = auto) {
    let writer = new BufferWriter();
    encoding.write(writer, context, data);
    return writer.getUint8Array();
}
