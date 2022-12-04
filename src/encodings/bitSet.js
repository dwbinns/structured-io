import Encoding from "../Encoding.js";
import u8 from "./u8.js";
import u16 from "./u16.js";
import u32 from "./u32.js";

class BitSet extends Encoding {
    constructor(components, dataEncoding) {
        super();
        this.components = Object.entries(components).map(([name, index]) => [name, 1 << index]);
        //console.log("BITSET", Object.values(components));
        let bitSize = Math.max(...Object.values(components)) + 1;
        this.dataEncoding = dataEncoding || (
            bitSize <= 8 ? u8()
            : bitSize <= 16 ? u16()
            : bitSize <= 32 ? u32()
            : (() => {throw new Error(`Bit size > 32 not supported: ${bitSize}`);})()
        );
    }

    read(bufferReader, value) {
        let data = this.dataEncoding.read(bufferReader, context);
        // @ts-ignore
        return Object.fromEntries(this.components.map(([key, mask]) => [key, (data & mask) > 0]));
    }

    write(bufferWriter, value) {
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

export default (...args) => new BitSet(...args);
