const ScopeFactory = require("../definitions/ScopeFactory");
const Annotator = require("../annotate/Annotator");
const Encoding = require("../Encoding");
const annotate = require("../annotate");
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

        let regionReader = bufferReader.nestedReader();
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

module.exports = (where, ...args) => new Size(...args);

/*class Size extends Encoding {
    constructor(sizeEncoding, {offset = 0, unit = 1}, sizeScope) {
        super();
        Encoding.assert(sizeEncoding);
        this.sizeEncoding = sizeEncoding;
        this.offset = offset;
        this.unit = unit;
        this.sizeScope = sizeScope;
    }

    read(bufferReader, context, value) {
        value = this.sizeEncoding.read(bufferReader, context);
        this.sizeScope.on('start', regionReader => regionReader.setSize(value * this.unit + this.offset));
        this.sizeScope.on('end', regionReader => regionReader.eatAll());
        return value;
    }
    write(bufferWriter, context, value) {
        let here=bufferWriter.nestedWriter();
        this.sizeEncoding.write(bufferWriter, context, 0);
        this.sizeScope.on('end', regionWriter => {
            let size = regionWriter.getSize();
            let sizeUnits = ceil(max(0, size - this.offset) / this.unit);
            //console.log("Skip", sizeUnits, unit, size);
            regionWriter.skip(sizeUnits * this.unit - size);
            this.sizeEncoding.write(here, context, sizeUnits);
        });
    }

}

module.exports = (sizeEncoding, options, sizeScope) => 
    new Annotator(v => `size ${sizeScope.name || ''}`, new Size(sizeEncoding, options, sizeScope));
*/