function interpretEncoding(specification) {
    if (specification === null) {
        return nothing;
    }
    if (specification) {
        if (specification[Symbol.iterator]) {
            return sequence(specification);
        }
        if (specification.read && specification.write) {
            return specification;
        }
        if (typeof specification == "object" && Object.keys(specification).length == 1) {
            return field(Object.keys(specification)[0], Object.values(specification)[0]);
        }

        if (specification.encoding) {
            return object(specification);
        }
        if (typeof specification == "function") {
            return dynamic(specification);
        }
    }
    throw new Error("Type specification not understood: " + JSON.stringify(specification));
}





function encodingLookup(encodingFieldSpecification, options, content) {
    let typeEncoding = interpretEncoding(encodingFieldSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let type = typeEncoding.read(bufferReader, context);
            return options.find(([type, encoder]) => option.canDecode(type)).read(bufferReader, context);
        }
        write(bufferWriter, context, value) {
            options.find(([type, encoder]) => encoder.canEncode(value)).write(bufferWriter, context, value);
        }
    };
}

class UnknownType {
    constructor(type) {
        this.type = type;
        this.data = null;
    }
}
UnknownType.encoding = [
    field('data', bytes )
];



const cString = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readCString();
    }
    write(bufferWriter, context, value) {
        throw new Error("Not yet implemented");
    }
}

class Lazy {
    constructor(uint8array, context, encoding, value) {
        Object.assign(this, { uint8array, context, encoding, value });
    }
    get() {
        return read(this.uint8array, this.context, this.value);
    }
    set(value) {
        write(value);
    }
}

function lazy(specification) {
    let encoding = interpretEncoding(specification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let data = bufferReader.readBytes();
            return new Lazy(data, context, encoding, value);
        }
        write(bufferWriter, context, value) {
            bufferWriter.writeBytes(value);
        }
    };
}


function align(size) {
    return new class extends Encoding {
        read(bufferReader, context) {
            return bufferReader.align(size);
        }
        write(bufferWriter, context, value) {
            bufferWriter.align(size);
        }
    };
}


function aligned(content) {
    let contentEncoder = interpretEncoding(content);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let sectionReader = bufferReader.subReader();
            sectionReader.settings.align = true;
            value = contentEncoder.read(sectionReader, context, value);
            bufferReader.eat(sectionReader.getReadSize());
            return value;
        }
        write(bufferWriter, context, value) {
            let sectionWriter = bufferWriter.subWriter();
            sectionWriter.settings.align = true;
            contentEncoder.write(sectionWriter, context, value);
            bufferWriter.skip(sectionWriter.getSize());
        }
    };
}


function maybe(contentSpecification) {
    let contentEncoding = interpretEncoding(contentSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let maybeReader = bufferReader.subReader();
            try {
                value = contentEncoding.read(maybeReader, context, value);
                bufferReader.eat(maybeReader.getReadSize());
                return value;
            } catch (e) {
                if (!(e instanceof OverflowError)) {
                    throw e;
                }
                bufferReader.readBytes();
            }
        }
        write(bufferWriter, context, value) {
            contentEncoding.write(bufferWriter, context, value);
        }
    };
}


