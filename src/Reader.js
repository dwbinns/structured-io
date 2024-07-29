import { BufferReader, OverflowError, ResizableBuffer } from 'buffer-io';
import getEncoding from './getEncoding.js';

export default class Reader {
    constructor() {
        this.resizableBuffer = new ResizableBuffer();
        this.size = 0;
        this.ended = false;
    }

    consume(readable) {
        readable.on('data', chunk => this.append(chunk));
        readable.on('end', () => this.end());
        readable.on('error', (e) => this.error(e));
        return this;
    }

    async read(packetType) {
        return await new Promise((resolve, reject) => 
            this.listen(packetType, resolve, reject, () => reject(new Error("End of stream")), true)
        );
    }

    async * iterate(packetType) {
        try {
            while (true) {
                yield await this.read(packetType);
            }
        } catch (e) {
            if (!e) return;
            throw e;
        }
    }

    listen(packetType, onPacket, onError, onEnded, once) {
        this.encoding = getEncoding(packetType);
        this.onPacket = onPacket;
        this.onError = onError;
        this.onEnded = onEnded;
        this.once = once;
        this.check();
        return this;
    }

    end() {
        this.ended = true;
        this.check();
    }

    error(e) {
        this.onError?.(e);
    }

    append(uint8array) {
        if (this.log) console.log("append", uint8array.length);
        this.resizableBuffer.get(this.size + uint8array.length).uint8array.set(uint8array, this.size);
        this.size += uint8array.length;
        this.check();
    }

    check() {
        while (this.encoding && this.size > 0) {
            try {
                //if (this.log) console.log("check", this.size);
                let bufferReader = new BufferReader(this.resizableBuffer.uint8array.subarray(0, this.size));
                let result = this.encoding.read(bufferReader);
                let readSize = bufferReader.index;

                let readData = this.resizableBuffer.uint8array.subarray(0, readSize);
                if (this.once) this.encoding = null;
                this.onPacket(result, readData);
                this.size -= readSize;
                this.resizableBuffer.trim(readSize);
            } catch (e) {
                if (!(e instanceof OverflowError)) {
                    this.onError?.(e);
                }
                break;
            }
        }
        if (this.ended && this.encoding) {
            this.onEnded?.();
        }
    }
}
