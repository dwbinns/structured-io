const tap = require('tap')

const {u8, u16, u24, explain, read, write, definition, sequence, fields, fixed, size, type, dynamic, bytes, ignore} = require("..")

class Body {
    constructor(content, variable = [], bytes = []) {
        this.content = content;
        this.testSizeSeparate = Uint8Array.of(...variable);
        this.testSizePrefix = Uint8Array.of(...variable.map(v => v + 100));
        this.testSizeIncluded = Uint8Array.of(...variable.map(v => v + 200));
        this.testFixedBytes = Uint8Array.of(...bytes);
    }
}

Body.encoding = definition((sizeSeparate, sizeIncluded) => sequence(
    sizeSeparate(u16()),
    fields({
        content: u24(),
        testSizeSeparate: size(sizeSeparate, {}, bytes()),
        testSizePrefix: size(u8(), {}, bytes()),
    }),
    size(sizeIncluded, {},
        sequence(
            sizeIncluded(u8()),
            fields({
                testSizeIncluded: bytes()
            }),
        )
    ),
    fields({
        testFixedBytes: bytes(4)
    }),
));

class Message {
    constructor(version, extra, body) {
        this.version = version;
        this.extra = extra;
        this.body = body;
    }
}

Message.encoding = sequence(
    fields({version: u8()}),
    fixed(u8(), 1),
    dynamic(v => v.version >= 0 && fields({extra: u8()})),
    fields({
        //body: ofClass(Body),
        body: type(u8(), {
            3: Body,
        })
    }),
    ignore(2),
);


let writeMessage = new Message(0, 2, new Body(0x40506, [7, 8, 9], [10, 11, 12, 13]));

let data = write(writeMessage);
//console.log('data>',new Uint8Array(data).join(','));
console.log(explain(data, Message));
let readMessage = read(data, Message);
// @ts-ignore
tap.same(readMessage, writeMessage, "Round trip succeeded");

