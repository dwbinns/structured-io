const { BufferWriter } = require('buffer-io');
const auto = require('./encodings/auto');
const getEncoding = require('./getEncoding');

module.exports = function write(data, context, encoding = auto()) {
    let writer = new BufferWriter();
    getEncoding(encoding).write(writer, context, data);
    return writer.getUint8Array();
}
