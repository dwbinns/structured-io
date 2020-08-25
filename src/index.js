const {wrap} = require('./capture');

module.exports = {
    // Classes to instantiate or extend:
    Annotated: require('./annotate/Annotated'),
    AnnotatedValue: require('./annotate/AnnotatedValue'),
    Encoding: require('./Encoding'),
    PacketProcessor: require('./PacketProcessor'),

    // functions to encode or decode data:
    read: wrap(require('./read')),
    write: wrap(require('./write')),
    explain: wrap(require('./explain')),

    // Encodings to describe data:
    array: wrap(require('./encodings/array')),
    arrayLength: wrap(require('./encodings/arrayLength')),
    ascii: wrap(require('./encodings/ascii')),
    auto: wrap(require('./encodings/auto')),
    bigEndian: wrap(require('./encodings/bigEndian')),
    bitSet: wrap(require('./encodings/bitSet')),
    bytes: wrap(require('./encodings/bytes')),
    call: wrap(require('./encodings/call')),
    collect: wrap(require('./encodings/collect')),
    condition: wrap(require('./encodings/condition')),
    definition: wrap(require('./encodings/define')),
    dynamic: wrap(require('./encodings/dynamic')),
    field: wrap(require('./encodings/field')),
    fields: wrap(require('./encodings/fields')),
    fixed: wrap(require('./encodings/fixed')),
    ignore: wrap(require('./encodings/ignore')),
    instance: wrap(require('./encodings/instance')),
    latin1: wrap(require('./encodings/latin1')),
    littleEndian: wrap(require('./encodings/littleEndian')),
    nothing: wrap(require('./encodings/nothing')),
    optional: wrap(require('./encodings/optional')),
    pad: wrap(require('./encodings/pad')),
    scope: wrap(require('./encodings/scope')),
    sequence: wrap(require('./encodings/sequence')),
    size: wrap(require('./encodings/size')),
    sized: wrap(require('./encodings/sized')),
    string: wrap(require('./encodings/string')),
    transform: wrap(require('./encodings/transform')),
    type: wrap(require('./encodings/type')),
    u8: wrap(require('./encodings/u8')),
    u16: wrap(require('./encodings/u16')),
    u24: wrap(require('./encodings/u24')),
    u32: wrap(require('./encodings/u32')),
    u64bigint: wrap(require('./encodings/u64bigint')),
};


