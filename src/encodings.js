const AutoMap = require('auto-creating-map');
const {OverflowError} = require("buffer-io");

Error.stackTraceLimit = Infinity;

class Encoding {
    read() {}
    write() {}
}

const u8 = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU8();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU8(value);
    }
};

const u16BE = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU16();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU16(value);
    }
};

const u16LE = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU16(true);
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU16(value, true);
    }
};



const u24BE = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU24();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU24(value);
    }
};

const u32LE = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU32(true);
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU32(value, true);
    }
};


const u32BE = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU32();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU32(value);
    }
};

const u64BEbig = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU64big();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU64big(value);
    }
};

const u64LEbig = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU64big(true);
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU64big(value, true);
    }
};

const cString = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readCString();
    }
    write(bufferWriter, context, value) {
        throw new Error("Not yet implemented");
    }
}

const nothing = new class extends Encoding {
    read(bufferReader, context) {
    }
    write(bufferWriter, context, value) {
    }
};

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



class AnnotateContext {
    constructor(bufferReader) {
        this.bufferReader = bufferReader;
        this.start = this.bufferReader.index;
        this.children = [];
    }

    print(indent) {
        let position = this.start;
        for (let child of this.children) {
            if (position < child.start) console.log(indent, );
            child.print(indent + "  ");
            position = child.end;
        }
        if (position < this.end) console.log(indent, this.bufferReader.uint8array.subarray(position, this.end).map(v => v.toString(16).padStart(2, '0').join(" ")));
    }

    child() {
        let child = new AnnotateContext(this.bufferReader);
        this.children.push(child);
        return child;
    }

    end(text) {
        this.text = text;
        this.end = this.bufferReader.index;
    }
}

function annotate(annotator, content) {
    return new class extends Encoding {
        read(bufferReader, context, value) {
            try {

                if (context instanceof AnnotateContext) {
                    let nestedContext = context.child();
                    let result = content.read(bufferReader, context, value);
                    nestedContext.end(annotator(result));
                    return result;
                }
                return content.read(bufferReader, context, value);

            } catch (e) {
                e.stack += `\nIn: ${annotator(value)}`;
                throw e;
            }
        }
        write(bufferWriter, context, value) {
            try {
                content.write(bufferWriter, context, value);
            } catch (e) {
                e.stack += `\nIn: ${annotator(value)}`;
                throw e;
            }
        }
    };
}

function interpretEncoding(specification) {
    if (specification == null) {
        return nothing;
    }
    if (specification) {
        if (specification[Symbol.iterator]) {
            return sequence(specification);
        }
        if (specification.read && specification.write) {
            return specification;
        }
        if (typeof specification=="object" && Object.keys(specification).length == 1) {
            return field(Object.keys(specification)[0],Object.values(specification)[0]);
        }

        if (specification.encoding) {
            return object(specification);
        }
        if (typeof specification == "function") {
            return dynamic(specification);
        }
    }
    throw new Error("Type specification not understood: "+JSON.stringify(specification));
}

function dynamic(factory) {
    return new class extends Encoding {
        read(bufferReader, context, value) {
            return interpretEncoding(factory(value, context)).read(bufferReader, context, value);
        }
        write(bufferWriter, context, value) {
             interpretEncoding(factory(value, context)).write(bufferWriter, context, value);
        }
    };
}



function object(classType) {
    let type = interpretEncoding(classType.encoding);
    return annotate(v => `object: ${classType.name}`, new class extends Encoding {
        read(bufferReader, context, value) {
            value = value || new classType();
            type.read(bufferReader, context, value);
            return value;
        }
        write(bufferWriter, context, value) {
            type.write(bufferWriter, context, value);
        }
    });
}

function object(classType, encoding=classType.encoding) {
    let type = interpretEncoding(encoding);

    return annotate(() => `object ${classType.name}`, new class extends Encoding {
        read(bufferReader, context, value) {
            value = value || new classType();
            type.read(bufferReader, context, value);
            return value;
        }
        write(bufferWriter, context, value) {
            type.write(bufferWriter, context, value);
        }
    });
}

function transform(fieldSpecification, read, write) {
    let fieldEncoding = interpretEncoding(fieldSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            return read(fieldEncoding.read(bufferReader, context));
        }
        write(bufferWriter, context, value) {
            fieldEncoding.write(bufferWriter, context, write(value));
        }
    };
}

function alternative(fieldSpecification, options) {
    let valueLookup = new Map(Object.entries(options).map(([key, value])=>[value, Number(key)]));
    let codeLookup = new Map(Object.entries(options).map(([key, value])=>[Number(key), value]));

    function read(code) {
        if (!codeLookup.has(code)) throw new Error("Unknown code: "+code);
        return codeLookup.get(code);
    }

    function write(value) {
        if (!valueLookup.has(value)) throw new Error("Unknown option: "+value);
        return valueLookup.get(value);
    }

    return transform(fieldSpecification, read, write);
}



function encodingLookup(encodingFieldSpecification, options, content) {
    let typeEncoding=interpretEncoding(encodingFieldSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let type = typeEncoding.read(bufferReader, context);
            return options.find(([type,encoder])=>option.canDecode(type)).read(bufferReader, context);
        }
        write(bufferWriter, context, value) {
            options.find(([type,encoder])=>encoder.canEncode(value)).write(bufferWriter, context, value);
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
    {data: bytes}
];


function type(typeSpecification, options, fieldSpecification) {
    let fieldEncoding = fieldSpecification && interpretEncoding(fieldSpecification);
    let valueLookup = new Map(Object.entries(options).map(([key, value])=>[value, Number(key)]));
    let codeLookup = new Map(Object.entries(options).map(([key, value])=>[Number(key), value]));

    function read(code) {
        if (!codeLookup.has(code)) return new UnknownType(code);
        return new (codeLookup.get(code));
    }

    function write(value) {
        if (value instanceof UnknownType) return value.type;
        return valueLookup.get(value.constructor);
    }

    let typeEncoding = transform(typeSpecification, read, write);

    return new class extends Encoding {
        read(bufferReader, context, value) {
            let result = typeEncoding.read(bufferReader, context, value);
            if (fieldEncoding) return fieldEncoding.read(bufferReader, context, result);
            return result;
        }
        write(bufferWriter, context, value) {
            typeEncoding.write(bufferWriter, context, value);
            if (fieldEncoding) fieldEncoding.write(bufferWriter, context, value);
        }
    };
}


function fixed(fieldSpecification, fixedValue) {
    let type = interpretEncoding(fieldSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let readValue= type.read(bufferReader, context, value);
            if (readValue!=fixedValue) {
                throw new Error(`Unexpected value, read:${readValue}, expected: ${fixedValue}`);
            }
            return readValue;
        }
        write(bufferWriter, context, value) {
            type.write(bufferWriter, context, fixedValue);
        }
    };
}


const auto = annotate(v => `${v.constructor.name}`, new class extends Encoding {
    read(bufferReader, context, value) {
        interpretEncoding(value.constructor.encoding).read(bufferReader, context, value);
        return value;
    }
    write(bufferWriter, context, value) {
        interpretEncoding(value.constructor.encoding).write(bufferWriter, context, value);
    }
});

class Lazy {
    constructor(uint8array, context, encoding, value) {
        Object.assign(this,{uint8array, context, encoding, value});
    }
    get() {
        return read(this.uint8array, this.context, this.value);
    }
    set(value) {
        write(value);
    }
}

function lazy(specification) {
    let encoding=interpretEncoding(specification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let data=bufferReader.readBytes();
            return new Lazy(data, context, encoding, value);
        }
        write(bufferWriter, context, value) {
            bufferWriter.writeBytes(value);
        }
    };
}

function field(name, specification) {
    let type = interpretEncoding(specification);
    return annotate(() => `field: ${name}`, new class extends Encoding {
        read(bufferReader, context, value) {
            value[name] = type.read(bufferReader, context, value[name]);
            return value;
        }
        write(bufferWriter, context, value) {
            type.write(bufferWriter, context, value[name]);
        }
    });
}

function sequence(components) {
    let types = components.map(interpretEncoding);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let result;
            for (let type of types) {
                result = type.read(bufferReader, context, value);
            }
            return result;
        }
        write(bufferWriter, context, value) {
            for (let type of types) {
                type.write(bufferWriter, context, value);
            }
        }
    };
}

function bytes(size) {
    return new class Bytes extends Encoding {
        read(bufferReader, context, value) {
            return bufferReader.readBytes(size);
        }
        write(bufferWriter, context, value) {
            //console.log("writebytes",value.length,size);
            bufferWriter.writeBytes(value.slice(0, size));
            if (size > value.length) bufferWriter.skip(size - value.length);
        }
    };
}


function array(contentSpecification) {
    let contentEncoding=interpretEncoding(contentSpecification);
    return errorLog(v => `item of array`, true, new class extends Encoding {
        read(bufferReader, context, value) {
            value = [];
            while (!bufferReader.eof()) {
                value.push(contentEncoding.read(bufferReader, context));
            }
            return value;
        }
        write(bufferWriter, context, value) {
            for (let item of value) {
                contentEncoding.write(bufferWriter, context, item);
            }
        }
    });
}

function maybe(contentSpecification) {
    let contentEncoding=interpretEncoding(contentSpecification);
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


function region() {
    let callbacks = {
        start: [],
        end: [],
    };

    let bufferRW;

    function regionContent(contentSpecification) {
        let contentEncoding = interpretEncoding(contentSpecification);
        return new class extends Encoding {
            read(bufferReader, context, value) {

                let regionReader = bufferReader.subReader();
                bufferRW = regionReader;
                callbacks.start.forEach(callback => callback(regionReader));
                value = contentEncoding.read(regionReader, context, value);
                callbacks.end.forEach(callback => callback(regionReader));
                bufferReader.eat(regionReader.getReadSize());
                return value;
            }
            write(bufferWriter, context, value) {

                let regionWriter = bufferWriter.subWriter();
                bufferRW = regionWriter;
                callbacks.start.forEach(callback => callback(regionWriter));
                contentEncoding.write(regionWriter, context, value);
                callbacks.end.forEach(callback => callback(regionWriter));
                bufferWriter.skip(regionWriter.getSize());
            }
        };

    }

    regionContent.on = (event, callback) => {
        if (event == "start" && bufferRW) callback(bufferRW);
        else callbacks[event].push(callback);
    };

    return regionContent;
}

function scope(factory) {
    return new class extends Encoding {
        read(bufferReader, context, value) {
            return interpretEncoding(factory(region())).read(bufferReader, context, value);
        }
        write(bufferWriter, context, value) {
            interpretEncoding(factory(region())).write(bufferWriter, context, value);
        }
    };
}

function collect(factory) {
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let result;
            let collector = resultSpecification => new class extends Encoding {
                read(bufferReader, context, value) {
                    result = interpretEncoding(resultSpecification).read(bufferReader, context, value);
                }
            };
            interpretEncoding(factory(collector)).read(bufferReader, context, value);
            return result;
        }
        write(bufferWriter, context, value) {
            interpretEncoding(factory(resultSpecification => interpretEncoding(resultSpecification))).write(bufferWriter, context, value);
        }
    };
}


function size(sizeSpecification, sizeScope) {
    if (!sizeScope.on) return sized(sizeSpecification, sizeScope);

    let sizeEncoding = interpretEncoding(sizeSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            value = sizeEncoding.read(bufferReader, context);
            sizeScope.on('start', regionReader => regionReader.setSize(value));
            sizeScope.on('end', regionReader => regionReader.eatAll());
            return value;
        }
        write(bufferWriter, context, value) {
            let here=bufferWriter.subWriter();
            sizeEncoding.write(bufferWriter, context, 0);
            sizeScope.on('end', regionWriter => sizeEncoding.write(here, context, regionWriter.getSize()));
        }
    };
}

function sized(sizeSpecification, contentSpecification) {
    return collect(results => scope(contentScope => [size(sizeSpecification, contentScope), contentScope(results(contentSpecification))]));
}


module.exports = {u8, u16BE, u24BE, u32BE, u64BE, auto, type, alternative, fixed, bytes, size, sized, scope, array, lazy, Encoding, interpretEncoding, AnnotateContext};

