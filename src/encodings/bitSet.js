const Encoding = require("../Encoding");
const annotate = require("../annotate");
const u8 = require("./u8").internal;
const u16 = require("./u16").internal;
const u32 = require("./u32").internal;

class BitSet extends Encoding {
    constructor(components, dataEncoding) {
        super();
        this.components = Object.entries(components).map(([name, index]) => [name, 1 << index]);
        console.log("BITSET", Object.values(components));
        let bitSize = Math.max(...Object.values(components)) + 1;
        this.dataEncoding = dataEncoding || (
            bitSize <= 8 ? u8()
            : bitSize <= 16 ? u16()
            : bitSize <= 32 ? u32()
            : (() => {throw new Error(`Bit size > 32 not supported: ${bitSize}`);})()
        );
    }

    read(bufferReader, context, value) {
        let data = this.dataEncoding.read(bufferReader, context);
        // @ts-ignore
        return Object.fromEntries(this.components.map(([key, mask]) => [key, (data & mask) > 0]));
    }

    write(bufferWriter, context, value) {
        this.dataEncoding.write(
            bufferWriter,
            context,
            this.components.reduce(
                // @ts-ignore
                (accumulator, [name, mask]) => accumulator + (value[name] ? mask : 0),
                0
            ), 
        );
    }
}

module.exports = annotate(v => `bitset`, BitSet);
