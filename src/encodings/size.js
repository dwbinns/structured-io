const Encoding = require("../Encoding");
const annotate = require("./annotate");

const {ceil, max} = Math;

module.exports = function size(sizeEncoding, options, sizeScope) {
    let { offset = 0, unit = 1 } = typeof options == "number" ? { unit: options } : options;

    return annotate(v => `size ${sizeScope.scopeName || ''}`, new class extends Encoding {
        read(bufferReader, context, value) {
            value = sizeEncoding.read(bufferReader, context);
            //console.log("size", value, unit, offset);
            sizeScope.on('start', regionReader => regionReader.setSize(value * unit + offset));
            sizeScope.on('end', regionReader => regionReader.eatAll());
            return value;
        }
        write(bufferWriter, context, value) {
            let here = bufferWriter.subWriter();
            sizeEncoding.write(bufferWriter, context, 0);
            sizeScope.on('end', regionWriter => {
                let size = regionWriter.getSize();
                let sizeUnits = ceil(max(0, size - offset) / unit);
                //console.log("Skip", sizeUnits, unit, size);
                regionWriter.skip(sizeUnits * unit - size);
                sizeEncoding.write(here, context, sizeUnits);
            });
        }
    });
}
