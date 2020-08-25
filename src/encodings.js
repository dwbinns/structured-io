// const AutoMap = require('auto-creating-map');
// const {OverflowError} = require("buffer-io");

// Error.stackTraceLimit = Infinity;

// const {min, max, ceil} = Math;

// class Encoding {
//     read() {}
//     write() {}
// }

// const u8 = annotate(v => `u8: ${v}`, new class extends Encoding {
//     read(bufferReader, context) {
//         return bufferReader.readU8();
//     }
//     write(bufferWriter, value) {
//         bufferWriter.writeU8(value);
//     }
// });

// const u16 = annotate(v => `u16: ${v}`, new class extends Encoding {
//     read(bufferReader, context) {
//         return bufferReader.readU16();
//     }
//     write(bufferWriter, value) {
//         bufferWriter.writeU16(value);
//     }
// });


// const u24 = annotate(v => `u24: ${v}`, new class extends Encoding {
//     read(bufferReader, context) {
//         return bufferReader.readU24();
//     }
//     write(bufferWriter, value) {
//         bufferWriter.writeU24(value);
//     }
// });


// const u32 = annotate(v => `u32: ${v}`, new class extends Encoding {
//     read(bufferReader, context) {
//         return bufferReader.readU32();
//     }
//     write(bufferWriter, value) {
//         bufferWriter.writeU32(value);
//     }
// });



// const u64big = annotate(v => `u64: ${v}`, new class extends Encoding {
//     read(bufferReader, context) {
//         return bufferReader.readU64big();
//     }
//     write(bufferWriter, value) {
//         bufferWriter.writeU64big(value);
//     }
// });

// const cString = new class extends Encoding {
//     read(bufferReader, context) {
//         return bufferReader.readCString();
//     }
//     write(bufferWriter, value) {
//         throw new Error("Not yet implemented");
//     }
// }



// const nothing = new class extends Encoding {
//     read(bufferReader, context) {
//     }
//     write(bufferWriter, value) {
//     }
// };

// function align(size) {
//     return new class extends Encoding {
//         read(bufferReader, context) {
//             return bufferReader.align(size);
//         }
//         write(bufferWriter, value) {
//             bufferWriter.align(size);
//         }
//     };
// }


// function aligned(content) {
//     let contentEncoder = interpretEncoding(content);
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             let sectionReader = bufferReader.here();
//             sectionReader.settings.align = true;
//             value = contentEncoder.read(sectionReader, value);
//             bufferReader.eat(sectionReader.getReadSize());
//             return value;
//         }
//         write(bufferWriter, value) {
//             let sectionWriter = bufferWriter.here();
//             sectionWriter.settings.align = true;
//             contentEncoder.write(sectionWriter, value);
//             bufferWriter.skip(sectionWriter.getSize());
//         }
//     };
// }



// class AnnotateContext {
//     constructor(bufferReader) {
//         this.bufferReader = bufferReader;
//         this.start = this.bufferReader.index;
//         this.children = [];
//         this.text = '';
//     }

//     format(from, to) {
//         return new Array(max(1, ceil((to - from) / 8))).fill()
//             .map((_, line) => [...this.bufferReader.uint8array.subarray(from + line * 8, min(to, from + (line + 1) * 8))]
//                 .map(v => v.toString(16).padStart(2, '0'))
//                 .join(" ")
//                 .padEnd(8*3)
//             )
//             .join("\n");
//         this.text = '';
//     }

//     format(from, to) {
//         return new Array(max(1, ceil((to - from) / 8)))
//             .fill()
//             .map((_, line) => [...this.bufferReader.uint8array.subarray(from + line * 8, min(to, from + (line + 1) * 8))]
//                 .map(v => v.toString(16).padStart(2, '0'))
//                 .join(" ")
//                 .padEnd(8*3)
//             )
//             .join("\n");
//     }

//     print(indent = '') {
//         let first = true;
//         let position = this.start;
//         //console.log(this.text, this.start, this.end);
//         for (let child of this.children) {
//             if (position < child.start || first) console.log(`${this.format(position, child.start)}${indent}${this.text}`);
//             child.print(indent + "  ");
//             position = child.end;
//             first = false;
//         }
//         if (position < this.end) console.log(`${this.format(position, this.end)}${indent}${this.text}`);
//     }

//     child(bufferReader) {
//         let child = new AnnotateContext(bufferReader);
//         this.children.push(child);
//         return child;
//     }

//     end(text) {
//         this.text = text;
//         this.end = this.bufferReader.index;
//     }
// }

// function annotate(annotator, content) {
//     let defined = '\n' + new Error().stack.split("\n").slice(3).join("\n");
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             try {

//                 if (context instanceof AnnotateContext) {
//                     let nestedContext = context.child(bufferReader);
//                     let result = content.read(bufferReader, nestedContext, value);
//                     nestedContext.end(annotator(result));
//                     return result;
//                 }
//                 return content.read(bufferReader, value);

//             } catch (e) {
//                 e.stack += `\nIn: ${annotator(value)} ${defined}`;
//                 throw e;
//             }
//         }
//         write(bufferWriter, value) {
//             try {
//                 content.write(bufferWriter, value);
//             } catch (e) {
//                 e.stack += `\nIn: ${annotator(value)} ${defined}`;
//                 throw e;
//             }
//         }
//     };
// }

// function interpretEncoding(specification) {
//     if (specification === null) {
//         return nothing;
//     }
//     if (specification) {
//         if (specification[Symbol.iterator]) {
//             return sequence(specification);
//         }
//         if (specification.read && specification.write) {
//             return specification;
//         }
//         if (typeof specification == "object" && Object.keys(specification).length == 1) {
//             return field(Object.keys(specification)[0],Object.values(specification)[0]);
//         }

//         if (specification.encoding) {
//             return object(specification);
//         }
//         if (typeof specification == "function") {
//             return dynamic(specification);
//         }
//     }
//     throw new Error("Type specification not understood: "+JSON.stringify(specification));
// }

// function dynamic(factory) {
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             return interpretEncoding(factory(value, context)).read(bufferReader, value);
//         }
//         write(bufferWriter, value) {
//              interpretEncoding(factory(value, context)).write(bufferWriter, value);
//         }
//     };
// }



// function object(classType) {
//     let type = interpretEncoding(classType.encoding);
//     return annotate(v => `object: ${classType.name}`, new class extends Encoding {
//         read(bufferReader, value) {
//             value = value || new classType();
//             type.read(bufferReader, value);
//             return value;
//         }
//         write(bufferWriter, value) {
//             type.write(bufferWriter, value);
//         }
//     });
// }

// function object(classType, encoding=classType.encoding) {
//     let type = interpretEncoding(encoding);

//     return annotate(() => `object ${classType.name}`, new class extends Encoding {
//         read(bufferReader, value) {
//             value = value || new classType();
//             type.read(bufferReader, value);
//             return value;
//         }
//         write(bufferWriter, value) {
//             type.write(bufferWriter, value);
//         }
//     });
// }

// function transform(fieldSpecification, read, write) {
//     let fieldEncoding = interpretEncoding(fieldSpecification);
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             return read(fieldEncoding.read(bufferReader, context));
//         }
//         write(bufferWriter, value) {
//             fieldEncoding.write(bufferWriter, write(value));
//         }
//     };
// }

// function alternative(fieldSpecification, options, defaultRead, defaultWrite) {
//     let valueLookup = new Map(Object.entries(options).map(([key, value])=>[value, Number(key)]));
//     let codeLookup = new Map(Object.entries(options).map(([key, value])=>[Number(key), value]));

//     function read(code) {
//         if (!codeLookup.has(code)) {
//             if (defaultRead) return defaultRead(code);
//             throw new Error("Unknown code: "+code);
//         }
//         return codeLookup.get(code);
//     }

//     function write(value) {
//         if (!valueLookup.has(value)) {
//             if (!codeLookup.has(code)) {
//                 if (defaultWrite) return defaultWrite(value);
//                 throw new Error("Unknown option: "+value);
//             }
//         }
//         return valueLookup.get(value);
//     }

//     return transform(fieldSpecification, read, write);
// }



// function encodingLookup(encodingFieldSpecification, options, content) {
//     let typeEncoding=interpretEncoding(encodingFieldSpecification);
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             let type = typeEncoding.read(bufferReader, context);
//             return options.find(([type,encoder])=>option.canDecode(type)).read(bufferReader, context);
//         }
//         write(bufferWriter, value) {
//             options.find(([type,encoder])=>encoder.canEncode(value)).write(bufferWriter, value);
//         }
//     };
// }

// class UnknownType {
//     constructor(type) {
//         this.type = type;
//         this.data = null;
//     }
// }
// UnknownType.encoding = [
//     {data: bytes}
// ];


// function type(typeSpecification, options, defaultClass) {
//     if (defaultClass && typeof defaultClass != "function") throw new Error("DefaultClass is not a function");
//     let codeLookup = new Map(Object.entries(options).map(([code, type])=>[type, Number(code)]));
//     let typeLookup = new Map(Object.entries(options).map(([code, type])=>[Number(code), type]));

//     let fieldEncoding = interpretEncoding(typeSpecification);

//     return annotate(v => `type: ${v ? v.constructor.name : "-"}`, new class extends Encoding {
//         read(bufferReader, value) {
//             let code = fieldEncoding.read(bufferReader, value);
//             let type = typeLookup.get(code);
//             if (!type) {
//                 if (!defaultClass) throw new Error(`Unknown code ${code}`);
//                 return new defaultClass(code);
//             }
//             return new type();
//         }
//         write(bufferWriter, value) {
//             let code;
//             if (defaultClass && value instanceof defaultClass) {
//                 code = value.code;
//             } else {
//                 if (!codeLookup.has(value.constructor)) throw new Error(`Unknown type ${value.constructor}`);
//                 code = codeLookup.get(value.constructor);
//             }
//             fieldEncoding.write(bufferWriter, code);
//         }
//     });
// }

// function typed(typeSpecification, options) {
//     return chain([type(typeSpecification, options), auto]);
// }


// function fixed(fieldSpecification, fixedValue) {
//     let type = interpretEncoding(fieldSpecification);
//     return annotate(v => `fixed(${fixedValue})`, new class extends Encoding {
//         read(bufferReader, value) {
//             let readValue= type.read(bufferReader, value);
//             if (readValue!=fixedValue) {
//                 throw new Error(`Unexpected value, read:${readValue}, expected: ${fixedValue}`);
//             }
//             return readValue;
//         }
//         write(bufferWriter, value) {
//             type.write(bufferWriter, fixedValue);
//         }
//     });
// }


// const auto = annotate(v => `auto: ${v.constructor.name}`, new class extends Encoding {
//     read(bufferReader, value) {
//         interpretEncoding(value.constructor.encoding).read(bufferReader, value);
//         return value;
//     }
//     write(bufferWriter, value) {
//         interpretEncoding(value.constructor.encoding).write(bufferWriter, value);
//     }
// });

// class Lazy {
//     constructor(uint8array, encoding, value) {
//         Object.assign(this,{uint8array, encoding, value});
//     }
//     get() {
//         return read(this.uint8array, this.context, this.value);
//     }
//     set(value) {
//         write(value);
//     }
// }

// function lazy(specification) {
//     let encoding=interpretEncoding(specification);
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             let data=bufferReader.readBytes();
//             return new Lazy(data, encoding, value);
//         }
//         write(bufferWriter, value) {
//             bufferWriter.writeBytes(value);
//         }
//     };
// }

// function field(name, specification) {
//     let type = interpretEncoding(specification);
//     return annotate(() => `field: ${name}`, new class extends Encoding {
//         read(bufferReader, value) {
//             value[name] = type.read(bufferReader, value[name]);
//             return value;
//         }
//         write(bufferWriter, value) {
//             type.write(bufferWriter, value[name]);
//         }
//     });
// }

// function sequence(components) {
//     let types = components.map(interpretEncoding);
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             types.forEach(type => type.read(bufferReader, value));
//             return value;
//         }
//         write(bufferWriter, value) {
//             for (let type of types) {
//                 type.write(bufferWriter, value);
//             }
//         }
//     };
// }

// function chain(components) {
//     let types = components.map(interpretEncoding);
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             return types.reduce((result, type) => type.read(bufferReader, result), value);
//         }
//         write(bufferWriter, value) {
//             for (let type of types) {
//                 type.write(bufferWriter, value);
//             }
//         }
//     };
// }

// function bytes(size) {
//     return annotate(v => `bytes: ${v.length}`, new class Bytes extends Encoding {
//         read(bufferReader, value) {
//             return bufferReader.readBytes(size);
//         }
//         write(bufferWriter, value) {
//             //console.log("writebytes",value.length,size);
//             bufferWriter.writeBytes(size ? value.slice(0, size) : value);
//             if (size > value.length) bufferWriter.skip(size - value.length);
//         }
//     });
// }



// function string(encoding = "utf8", size) {
//     return annotate(v => `ascii: ${v}`, new class Bytes extends Encoding {
//         read(bufferReader, value) {
//             return bufferReader.readBytes(size).toString(encoding);
//         }
//         write(bufferWriter, value) {
//             //console.log("writebytes",value.length,size);
//             let buffer = Buffer.from(value, encoding);
//             bufferWriter.writeBytes(size ? buffer.slice(0, size) : buffer);
//             if (size > buffer.length) bufferWriter.skip(size - buffer.length);
//         }
//     });
// }

// function ascii(size) {
//     return string("ascii", size);
// }

// function ignore(size) {
//     return new class Bytes extends Encoding {
//         read(bufferReader, value) {
//             bufferReader.eat(size);
//             return value;
//         }
//         write(bufferWriter, value) {
//             bufferWriter.skip(size);
//         }
//     };
// }


// function array(contentSpecification, fixed) {
//     let contentEncoding=interpretEncoding(contentSpecification);
//     return annotate(v => `item of array`, new class extends Encoding {
//         read(bufferReader, value) {
//             if (!fixed) {
//                 value = [];
//                 while (!bufferReader.eof()) {
//                     value.push(contentEncoding.read(bufferReader, context));
//                 }
//             } else {
//                 value.forEach((v, i) => value[i] = contentEncoding.read(bufferReader, v));
//             }
//             return value;
//         }
//         write(bufferWriter, value) {
//             for (let item of value) {
//                 contentEncoding.write(bufferWriter, item);
//             }
//         }
//     });
// }

// function maybe(contentSpecification) {
//     let contentEncoding=interpretEncoding(contentSpecification);
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             let maybeReader = bufferReader.here();
//             try {
//                 value = contentEncoding.read(maybeReader, value);
//                 bufferReader.eat(maybeReader.getReadSize());
//                 return value;
//             } catch (e) {
//                 if (!(e instanceof OverflowError)) {
//                     throw e;
//                 }
//                 bufferReader.readBytes();
//             }
//         }
//         write(bufferWriter, value) {
//             contentEncoding.write(bufferWriter, value);
//         }
//     };
// }

// function length(contentSpecification) {
//     let contentEncoding=interpretEncoding(contentSpecification);
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             value = new Array(contentEncoding.read(bufferReader, context)).fill(null);
//             return value;
//         }
//         write(bufferWriter, value) {
//             contentEncoding.write(bufferWriter, value.length);
//         }
//     };
// }


// function region(name) {
//     let callbacks = {
//         start: [],
//         end: [],
//     };

//     let bufferRW;

//     function regionContent(contentSpecification) {
//         let contentEncoding = interpretEncoding(contentSpecification);
//         return /*annotate(v=>`region:${name}`, */(new class extends Encoding {
//             read(bufferReader, value) {

//                 let regionReader = bufferReader.here();
//                 bufferRW = regionReader;
//                 callbacks.start.forEach(callback => callback(regionReader));
//                 value = contentEncoding.read(regionReader, value);
//                 callbacks.end.forEach(callback => callback(regionReader));
//                 bufferReader.eat(regionReader.getReadSize());
//                 return value;
//             }
//             write(bufferWriter, value) {

//                 let regionWriter = bufferWriter.here();
//                 bufferRW = regionWriter;
//                 callbacks.start.forEach(callback => callback(regionWriter));
//                 contentEncoding.write(regionWriter, value);
//                 callbacks.end.forEach(callback => callback(regionWriter));
//                 bufferWriter.skip(regionWriter.getSize());
//             }
//         });
//     }

//     regionContent.on = (event, callback) => {
//         if (event == "start" && bufferRW) callback(bufferRW);
//         else callbacks[event].push(callback);
//     };

//     regionContent.scopeName = name;

//     return regionContent;
// }

// function scope(name, factory = [name, name = null][0]) {
//     return annotate(v=>`scope: ${name}`, new class extends Encoding {
//         read(bufferReader, value) {
//             let regions = new Array(factory.length).fill().map(() => region(name));
//             return interpretEncoding(factory(...regions)).read(bufferReader, value);
//         }
//         write(bufferWriter, value) {
//             let regions = new Array(factory.length).fill().map(() => region(name));
//             interpretEncoding(factory(...regions)).write(bufferWriter, value);
//         }
//     });
// }

// function collect(factory) {
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             let result;
//             let collector = resultSpecification => new class extends Encoding {
//                 read(bufferReader, value) {
//                     result = interpretEncoding(resultSpecification).read(bufferReader, value);
//                 }
//             };
//             interpretEncoding(factory(collector)).read(bufferReader, value);
//             return result;
//         }
//         write(bufferWriter, value) {
//             interpretEncoding(factory(resultSpecification => interpretEncoding(resultSpecification))).write(bufferWriter, value);
//         }
//     };
// }



// function size(sizeSpecification, {offset = 0, unit = 1}, sizeScope) {
//     let sizeEncoding = interpretEncoding(sizeSpecification);
//     let name = sizeScope.scopeName;
//     return annotate(v => `size ${name || ''}`, new class extends Encoding {
//         read(bufferReader, value) {
//             value = sizeEncoding.read(bufferReader, context);
//             //console.log("size", value, unit, offset);
//             sizeScope.on('start', regionReader => regionReader.setSize(value * unit + offset));
//             sizeScope.on('end', regionReader => regionReader.eatAll());
//             return value;
//         }
//         write(bufferWriter, value) {
//             let here=bufferWriter.here();
//             sizeEncoding.write(bufferWriter, 0);
//             sizeScope.on('end', regionWriter => {
//                 let size = regionWriter.getSize();
//                 let sizeUnits = ceil(max(0, size - offset) / unit);
//                 //console.log("Skip", sizeUnits, unit, size);
//                 regionWriter.skip(sizeUnits * unit - size);
//                 sizeEncoding.write(here, sizeUnits);
//             });
//         }
//     });
// }

// function pad(padSize, contentSpecification) {
//     let contentEncoding = interpretEncoding(contentSpecification);
//     return annotate(v => `pad ${padSize}`, new class extends Encoding {
//         read(bufferReader, value) {
//             let subReader = bufferReader.here();
//             value = contentEncoding.read(subReader, value);
//             let readSize = subReader.getReadSize();
//             bufferReader.eat(ceil(readSize / padSize) * padSize);
//             return value;
//         }
//         write(bufferWriter, value) {
//             let nestedWriter = bufferWriter.here();
//             contentEncoding.write(nestedWriter, value);
//             let size = nestedWriter.getSize();
//             bufferWriter.skip(ceil(size / padSize) * padSize);
//         }
//     });
// }

// function endian(littleEndian, contentSpecification) {
//     let contentEncoding = interpretEncoding(contentSpecification);
//     return new class extends Encoding {
//         read(bufferReader, value) {
//             let subReader = bufferReader.here().configure({littleEndian});
//             value = contentEncoding.read(subReader, value);
//             bufferReader.eat(subReader.getReadSize());
//             return value;
//         }
//         write(bufferWriter, value) {
//             let nestedWriter = bufferWriter.here().configure({littleEndian});
//             contentEncoding.write(nestedWriter, value);
//             bufferWriter.skip(nestedWriter.getSize());
//         }
//     };
// }

// function littleEndian(contentSpecification) {
//     return endian(true, contentSpecification);
// }

// function bigEndian(contentSpecification) {
//     return endian(false, contentSpecification);
// }

// function sized(sizeSpecification, options, contentSpecification = [options, options = {}][0]) {
//     return collect(results => scope(contentScope => [size(sizeSpecification, options, contentScope), contentScope(results(contentSpecification))]));
// }


// module.exports = {
//     u8, u16, u24, u32, u64big, auto, type, typed, length, alternative,
//     fixed, bytes, ascii, string, ignore, size, sized, scope, array,
//     lazy, Encoding, interpretEncoding, AnnotateContext, pad,
//     littleEndian, bigEndian
// };
