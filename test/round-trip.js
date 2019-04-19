const tap = require('tap')
const {u8, u16BE, u24BE, explain, read, write, size, sized, type, auto, fixed, bytes, scope} = require('..');

class Body {
    constructor(content, variable = [], bytes = []) {
        this.content = content;
        this.sizeSeparate = Uint8Array.of(...variable);
        this.sizePrefix = Uint8Array.of(...variable.map(v => v + 10));
        this.sizeIncluded = Uint8Array.of(...variable.map(v => v + 20));
        this.bytes = Uint8Array.of(...bytes);
    }
}

Body.encoding = scope(sizeSeparate => [
    size(u16BE, sizeSeparate),
    {"content": u24BE},
    {"sizeSeparate": sizeSeparate(bytes())},
    {"sizePrefix": sized(u8, bytes())},
    scope(sizeIncluded => sizeIncluded([
        sized(u8, sizeIncluded),
        {"sizeIncluded": bytes()}
    ])),
    {"bytes": bytes(4)},
]);

class Message {
    constructor(version, extra, body) {
        this.version = version;
        this.extra = extra;
        this.body = body;
    }
}

Message.encoding = [
    {version: u8},
    fixed(u8, 1),
    v => v.version >= 0 ? {extra:u8} : [],
    {body: type(u8, {
        3: Body
    })},
    {body: auto},
];

let message=new Message(0, 2, new Body(0x40506, [7, 8, 9], [10, 11, 12, 13]));
let data = write(message);
//console.log(explain(data, Message));
console.log('data>',new Uint8Array(data).join(','));
//console.log(read(data, null, Message));
tap.same(read(data, null, Message), message, "Round trip succeeded");
