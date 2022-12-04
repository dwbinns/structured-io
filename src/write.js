import { BufferWriter } from 'buffer-io';
import auto from './encodings/auto.js';
import getEncoding from './getEncoding.js';

export default function write(data, encoding = auto()) {
    let writer = new BufferWriter();
    getEncoding(encoding).write(writer, data);
    return writer.getUint8Array();
};
