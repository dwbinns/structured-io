import Definition from "../definitions/Definition.js";
import Encoding from "../Encoding.js";
const {max, ceil} = Math;

class Size extends Encoding {
    constructor(size, {offset = 0, unit = 1}, contentEncoding) {
        super();
        this.size = size;

        this.contentEncoding = contentEncoding;
        this.unit = unit;
        this.offset = offset;
    }




    read(bufferReader, value) {
        let definition = Definition.read(this.size, bufferReader);

        let regionReader = bufferReader.here();
        definition.listen(size => {
            let bytes = size * this.unit + this.offset;
            //console.log("SIZE", size, this.unit, this.offset, bytes);
            regionReader.setSize(bytes);
            bufferReader.eat(bytes);
        });

        return this.contentEncoding.read(regionReader, value);
    }


    write(bufferWriter, value) {
        let definition = Definition.write(this.size, bufferWriter);

        let regionWriter = bufferWriter.here();
        this.contentEncoding.write(regionWriter, value);
        let size = regionWriter.getSize();

        let sizeUnits = ceil(max(0, size - this.offset) / this.unit);
        //console.log("compute size", size, this.offset, this.unit, sizeUnits);

        definition.set(sizeUnits);

        bufferWriter.skip(sizeUnits * this.unit);
    }

}

export default (...args) => new Size(...args);
