
const ScopeFactory = require("../definitions/ScopeFactory");
const Encoding = require("../Encoding");
const {max, ceil} = Math;

class Size extends Encoding {
    constructor(size, {offset = 0, unit = 1}, contentEncoding) {
        super();
        this.size = new ScopeFactory(size);

        this.contentEncoding = contentEncoding;
        this.unit = unit;
        this.offset = offset;
    }


    read(bufferReader, context, value) {
        let scope = this.size.getReadScope(bufferReader, context);

        let regionReader = bufferReader.subReader();
        scope.listen(size => {
            let bytes = size * this.unit + this.offset;
            //console.log("SIZE", size, this.unit, this.offset, bytes);
            regionReader.setSize(bytes);
            bufferReader.eat(bytes);
        });

        return this.contentEncoding.read(regionReader, context, value);
    }

    write(bufferWriter, context, value) {
        let scope = this.size.getWriteScope(bufferWriter, context);

        let regionWriter = bufferWriter.nestedWriter();
        this.contentEncoding.write(regionWriter, context, value);
        let size = regionWriter.getSize();
        let sizeUnits = ceil(max(0, size - this.offset) / this.unit);

        scope.set(sizeUnits);

        bufferWriter.skip(sizeUnits * this.unit);
    }

}

module.exports = (...args) => new Size(...args);
