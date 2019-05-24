const {interpretEncoding} = require('./encodings');
const {ResizableBuffer, OverflowError, BufferReader} = require('buffer-io');

module.exports = class PacketProcessor {
    constructor(onPacket, packetType, context) {
        this.onPacket=onPacket;
        this.resizableBuffer=new ResizableBuffer();
        if (packetType) this.setEncoding(packetType);
        this.size = 0;
        this.context=context;
        //console.log("processor",packetType);
    }
    setEncoding(packetType) {
        this.encoding=interpretEncoding(packetType);
    }
    attach(readable) {
        readable.on('data', chunk => this.write(chunk));
    }
    read(packetType) {
        this.setEncoding(packetType);
        return new Promise(resolve => this.onPacket = resolve);
    }
    listen(packetType, onPacket) {
        this.setEncoding(packetType);
        this.onPacket = onPacket;
    }
    write(uint8array) {
        this.resizableBuffer.get(this.size + uint8array.length).uint8array.set(uint8array,this.size);
        this.size+=uint8array.length;

        while (this.size>0) {
            //console.log('received', this.resizableBuffer.uint8array.subarray(0,this.size));
            try {
                let bufferReader=new BufferReader(this.resizableBuffer.uint8array.subarray(0,this.size));
                let result = this.encoding.read(bufferReader, this.context);
                let readSize = bufferReader.index;
                //console.log('processed',result);
                this.onPacket(result, this.resizableBuffer.uint8array.subarray(0,readSize));
                this.size -=readSize;
                this.resizableBuffer.trim(readSize);
            } catch (e) {
                console.log(e);
                if (!(e instanceof OverflowError)) {
                    //console.log('failed',e);
                    throw e;
                }

                return;
            }
        }
    }
}
