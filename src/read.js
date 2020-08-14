const { BufferReader } = require('buffer-io');
const Encoding = require('./Encoding');
const explain = require('./explain');
const getEncoding = require('./getEncoding');

module.exports = function read(...args) {
    let [uint8array, context, specification] = args.length == 3 ? args : [args[0], null, args[1]];

    let encoding = getEncoding(specification);
    try {
        let reader = new BufferReader(uint8array);
        return encoding.read(reader, context);
    } catch (e) {
        e.explain = () => explain(uint8array, encoding);
        throw e;
    }
}
