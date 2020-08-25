const { BufferWriter } = require('buffer-io');
const auto = require('./encodings/auto');
const getEncoding = require('./getEncoding');
const {wrap} = require('./capture');

module.exports = wrap(function write(data, encoding = auto()) {
    let writer = new BufferWriter();
    getEncoding(encoding).write(writer, data);
    return writer.getUint8Array();
});
