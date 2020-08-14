const tap = require('tap')

const {u8, u16, u24, explain, read, write, size, sized, type, auto, fixed, bytes, scope, none, dynamic, sequence, field, instance} = require('..');

class Body {
    constructor(content, variable = [], bytes = []) {
        this.content = content;
        this.sizeSeparate = Uint8Array.of(...variable);
        this.sizePrefix = Uint8Array.of(...variable.map(v => v + 10));
        this.sizeIncluded = Uint8Array.of(...variable.map(v => v + 20));
        this.bytes = Uint8Array.of(...bytes);
    }
}

Body.encoding = scope("sizeSeparate", sizeSeparate => sequence(
    size(u16, {}, sizeSeparate),
    field("content", u24),
    field("sizeSeparate", sizeSeparate(bytes())),
    field("sizePrefix", sized(u8, {}, bytes())),
    scope("sizeIncluded", sizeIncluded => sizeIncluded(sequence(
        size(u8, {}, sizeIncluded),
        field("sizeIncluded", bytes()),
    ))),
    field("bytes", bytes(4)),
));

class Message {
    constructor(version, extra, body) {
        this.version = version;
        this.extra = extra;
        this.body = body;
    }
}

Message.encoding = sequence(
    field("version", u8),
    fixed(u8, 1),
    dynamic(v => v.version >= 0 ? field("extra", u8) : none()),
    field("body", type(u8, {
        3: Body
    })),
    field("body", auto),
);


let message=new Message(0, 2, new Body(0x40506, [7, 8, 9], [10, 11, 12, 13]));
let data = write(message);
explain(data, instance(Message));
console.log('data>',new Uint8Array(data).join(','));
//console.log(read(data, null, Message));
tap.same(read(data, null, instance(Message)), message, "Round trip succeeded");
