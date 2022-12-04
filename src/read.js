import { BufferReader } from 'buffer-io';
import explain from './explain.js';
import getEncoding from './getEncoding.js';

export default function read(uint8array, specification, extra) {
    if (extra) throw new Error("Argument mismatch");
    let encoding = getEncoding(specification);
    try {
        let reader = new BufferReader(uint8array);
        return encoding.read(reader);
    } catch (e) {
        e.explain = () => explain(uint8array, encoding);
        throw e;
    }
}
