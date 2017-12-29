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
        return bufferReader.readU16BE();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU16BE(value);
    }
};

const u24BE = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU24BE();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU24BE(value);
    }
};


const u32BE = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU32BE();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU32BE(value);
    }
};

const u64BE = new class extends Encoding {
    read(bufferReader, context) {
        return bufferReader.readU64BE();
    }
    write(bufferWriter, context, value) {
        bufferWriter.writeU64BE(value);
    }
};

const nothing = new class extends Encoding {
    read(bufferReader, context) {
    }
    write(bufferWriter, context, value) {
    }
};


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
            return conditional(specification);
        }
    }
    throw new Error("Type specification not understood: "+JSON.stringify(specification));
}

function conditional(condition) {
    return new class extends Encoding {
        read(bufferReader, context, value) {
            return interpretEncoding(condition(value, context)).read(bufferReader, context, value);
        }
        write(bufferWriter, context, value) {
             interpretEncoding(condition(value, context)).write(bufferWriter, context, value);
        }
    };
}

function object(classType) {
    let type = interpretEncoding(classType.encoding);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            try {
                value = value || new classType();
                type.read(bufferReader, context, value);
                return value;
            } catch (e) {
                e.stack=e.stack+'\n'+'While reading object: '+classType.name;
                throw e;
            }
        }
        write(bufferWriter, context, value) {
            try {
                type.write(bufferWriter, context, value);
            } catch (e) {
                e.stack=e.stack+'\n'+'While writing object: '+classType.name;
                throw e;
            }
        }
    };
}

function alternative(fieldSpecification, options, defaultValue) {
    let fieldEncoding = interpretEncoding(fieldSpecification);
    let valueLookup = new Map(Object.entries(options).map(([key, value])=>[value, Number(key)]));
    let codeLookup = new Map(Object.entries(options).map(([key, value])=>[Number(key), value]));
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let code= fieldEncoding.read(bufferReader, context, value);
            if (!codeLookup.has(code)) {
                if (defaultValue!==undefined) {
                    return defaultValue;
                }
                throw new Error("Unknown code: "+code);
            }
            return codeLookup.get(code);
        }
        write(bufferWriter, context, value) {
            if (!valueLookup.has(value)) {
                throw new Error("Unknown option: "+value);
            }
            fieldEncoding.write(bufferWriter, context, valueLookup.get(value));
        }
    };
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


function type(typeFieldSpecification, options, fieldSpecification) {
    let typeAlternatives=alternative(typeFieldSpecification, options);
    let fieldEncoding = fieldSpecification && interpretEncoding(fieldSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let instance = new (typeAlternatives.read(bufferReader, context));
            if (fieldEncoding) return fieldEncoding.read(bufferReader, context, instance);
            return instance;
        }
        write(bufferWriter, context, value) {
            typeAlternatives.write(bufferWriter, context, value.constructor);
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


const auto = new class extends Encoding {
    read(bufferReader, context, value) {
        try {
            interpretEncoding(value.constructor.encoding).read(bufferReader, context, value);
            return value;
        } catch (e) {
            e.stack=e.stack+'\n'+'While reading object: '+ (value ? value.constructor.name : '<none>');
            throw e;
        }
    }
    write(bufferWriter, context, value) {
        try {
            interpretEncoding(value.constructor.encoding).write(bufferWriter, context, value);
        } catch (e) {
            e.stack=e.stack+'\n'+'While writing object: '+value.constructor.name;
            throw e;
        }

    }
};

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
    return new class extends Encoding {
        read(bufferReader, context, value) {
            try {
                value[name] = type.read(bufferReader, context, value[name]);
                return value;
            } catch (e) {
                e.stack=e.stack+'\n'+'While reading field: '+name+" of "+(value ? value.constructor.name : '<none>');
                throw e;
            }
        }
        write(bufferWriter, context, value) {
            try {
                type.write(bufferWriter, context, value[name]);
            } catch (e) {
                e.stack=e.stack+'\n'+'While writing field: '+name+" of "+value.constructor.name;
                throw e;
            }
        }
    };
}

function sequence(components) {
    let types = components.map(interpretEncoding);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            for (let type of types) {
                type.read(bufferReader, context, value);
            }
            return value;
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
            bufferWriter.writeBytes(value);
        }
    };
}

function array(contentSpecification) {
    let contentEncoding=interpretEncoding(contentSpecification);
    return new class extends Encoding {
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
    };
}

class ReaderRegion {
    constructor() {
        //this.size=undefined;
        this.callbacks=[];
    }
    start(bufferReader) {
        this.bufferReader=bufferReader.subReader();
        this.callbacks.forEach(callback=>callback(true, this.bufferReader));
        //if (this.size>=0) this.bufferReader.setSize(this.size);
        return this.bufferReader;
    }
    end(bufferReader) {
        //bufferReader.eat(this.size>0 ? this.size : this.bufferReader.index-this.bufferReader.start);
        this.callbacks.forEach(callback=>callback(false, this.bufferReader));
        bufferReader.eat(this.bufferReader.getReadSize());
    }

    on(callback) {
        if (this.bufferReader) {
            callback(true, this.bufferReader);
        } else {
            this.callbacks.push(callback);
        }
    }

/*    setSize(size) {
        this.size=size;
        if (this.bufferReader) {
            this.bufferReader.setSize(size);
        }
    }*/
}

class WriterRegion {
    constructor() {
        this.callbacks=[];
        this.ended=false;
    }
    start(bufferWriter) {
        this.bufferWriter=bufferWriter.subWriter();
        return this.bufferWriter;
    }
    end(bufferWriter) {
        bufferWriter.skip(this.bufferWriter.getSize());
        this.ended=true;
        this.callbacks.forEach(callback=>callback(this.bufferWriter));
    }
    on(callback) {
        if (this.ended) {
            callback(this.bufferWriter);
        } else {
            this.callbacks.push(callback);
        }
    }
}


function region(name, content) {
    let contentEncoder = interpretEncoding(content);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let region=bufferReader.getRegion(name);
            value = contentEncoder.read(region.start(bufferReader), context, value);
            region.end(bufferReader);
            return value;
        }
        write(bufferWriter, context, value) {
            let region=bufferWriter.getRegion(name);
            contentEncoder.write(region.start(bufferWriter), context, value);
            region.end(bufferWriter);
        }
    };
}

function sizeNamed(sizeSpecification, name) {
    let sizeEncoding = interpretEncoding(sizeSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            value = sizeEncoding.read(bufferReader, context);
            bufferReader.getRegion(name).on((start,regionReader)=>start ? regionReader.setSize(value) : regionReader.index=regionReader.index+start);
            return value;
        }
        write(bufferWriter, context, value) {
            let here=bufferWriter.subWriter();
            sizeEncoding.write(bufferWriter, context, 0);
            bufferWriter.getRegion(name).on((bufferWriter) => sizeEncoding.write(here, context, bufferWriter.getSize()));
        }
    };
}

function sizeRegion(sizeSpecification, targetSpecification) {
    let sizeEncoding = interpretEncoding(sizeSpecification);
    let targetEncoding=interpretEncoding(targetSpecification);
    return new class extends Encoding {
        read(bufferReader, context, value) {
            let size = sizeEncoding.read(bufferReader, context);
            let nestedReader = bufferReader.subReader();
            nestedReader.setSize(size);
            bufferReader.eat(size);
            return targetEncoding.read(nestedReader, context, value);
        }
        write(bufferWriter, context, value) {
            let here=bufferWriter.subWriter();
            sizeEncoding.write(bufferWriter, context, 0);
            let nestedWriter=bufferWriter.subWriter();
            targetEncoding.write(nestedWriter, context,value);
            bufferWriter.skip(nestedWriter.getSize());
            sizeEncoding.write(here, context, nestedWriter.getSize());
        }
    };
}

function size(sizeSpecification, target) {
    if (typeof target=="string") return sizeNamed(sizeSpecification, target);
    return sizeRegion(sizeSpecification, target);
}

module.exports = {u8, u16BE, u24BE, u32BE, u64BE, auto, type, alternative, fixed, bytes, size, region, array, lazy, Encoding, interpretEncoding};
