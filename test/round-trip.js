Error.stackTraceLimit = Infinity;

import { deepStrictEqual } from 'assert';
import { array, auto, ascii, utf8, u8, u16, u24, explain, read, write, definition, sequence, fields, fixed, size, type, dynamic, bytes, ignore } from "structured-io";

class SizeSeparate {
    constructor(text) {
        this.text = text;
    }

    static encoding = definition((sizeSeparate) =>
        sequence(
            sizeSeparate(u8()),
            fixed(u8(), 1),
            fields({ text: size(sizeSeparate, {}, utf8()) })
        )
    )
}

class SizePrefix {
    constructor(data) {
        this.data = data;
    }

    static encoding = size(u8(), {}, fields({ data: array(u8()) }))
}

class SizeIncluded {
    constructor(text) {
        this.text = text;
    }

    static encoding = definition((sizeIncluded) =>
        size(sizeIncluded, {},
            sequence(
                sizeIncluded(u8()),
                fields({ text: ascii() })
            )
        )
    )
}

class Body {
    constructor(content) {
        this.content = content;
    }

    static encoding =
        fields({
            content: bytes(3),
        });
}

class Message {
    constructor(version, extra, body) {
        this.version = version;
        this.extra = extra;
        this.body = body;
        this.sizePrefix = new SizePrefix([0, 1, 2]);
        this.sizeIncluded = new SizeIncluded("hello");
        this.sizeSeparate = new SizeSeparate("world");
    }

    static encoding = sequence(
        fields({ version: u16() }),
        fixed(u24(), 1),
        dynamic(v => v.version >= 0 && fields({ extra: u8() })),
        fields({
            body: type(u8(), {
                3: Body,
            }),

            sizeSeparate: auto(),
            sizeIncluded: auto(),
            sizePrefix: auto(),
        }),
        ignore(2),
    );
}


let writeMessage = new Message(0, 2, new Body(new Uint8Array([4, 5, 6])));

let data = write(writeMessage);
console.log('data>', new Uint8Array(data).join(','));
console.log(explain(data, Message));
let readMessage = read(data, Message);
deepStrictEqual(readMessage, writeMessage);


