const tap = require('tap')
const {u8, u16BE, u24BE, read, write, size, type, auto, fixed, bytes, region, lazy} = require('..');

class Body {
    constructor() {
        this.content=0x102030;
        this.variable=Uint8Array.of(50,60,70);
        this.bytes=Uint8Array.of(10,20,30,40);

    }
}

Body.encoding = [
    {"content":u24BE},
    [size(u16BE,"variable")],
    {"variable":region("variable",bytes())},
    {"bytes":bytes(4)},
];

class Message {
    constructor() {
        this.version=1;
        this.extra=2;
        this.body=new Body();
    }
}

Message.encoding = [
    {version:u8},
    fixed(u8, 3),
    (v)=>v.version>=1 ? {extra:u8} : [],
    {body:type(u8,{
        1: Body
    })},
    {body:auto},
];

let message=new Message();
let data=write(new Message());
//console.log(data.constructor);
//console.log('data>',new Uint8Array(data).join(','));
tap.same(read(data, null, Message), message, "Round trip succeeded");
