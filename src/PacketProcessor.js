const Encoding = require('./Encoding');
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
        this.encoding = Encoding.get(packetType);
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
        //console.log("got", this.size, uint8array.length);
        this.resizableBuffer.get(this.size + uint8array.length).uint8array.set(uint8array,this.size);
        this.size+=uint8array.length;

        while (this.size>0) {
            //console.log('received', this.resizableBuffer.uint8array.subarray(0,this.size));
            try {
                let bufferReader=new BufferReader(this.resizableBuffer.uint8array.subarray(0,this.size));
                let result = this.encoding.read(bufferReader, this.context);
                let readSize = bufferReader.index;

                let readData = this.resizableBuffer.uint8array.subarray(0,readSize);
                //console.log('processed',readSize);
                //require(".").explain(readData, this.encoding);
                this.onPacket(result, readData);
                this.size -= readSize;
                this.resizableBuffer.trim(readSize);
            } catch (e) {
                //console.log("no parse", e);
                if (!(e instanceof OverflowError)) {
                    //console.log('failed',e);
                    throw e;
                }

                return;
            }
        }
    }
}
