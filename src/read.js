const {BufferReader, BufferWriter} = require('buffer-io');
const auto = require('./encodings/auto');
const ofClass = require('./encodings/ofClass');
const Encoding = require("./Encoding");

function read(where, uint8array, target, context) {
    let encoding = Encoding.get(target);
    let reader=new BufferReader(uint8array);
    return encoding.read(reader, context);
}

module.exports = read;