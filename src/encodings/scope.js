// import Encoding from "../Encoding.js";
// import annotate from "./annotate.js";


// function region(name) {
//     let callbacks = {
//         start: [],
//         end: [],
//     };

//     let bufferRW;

//     function regionContent(contentEncoding) {
//         Encoding.check(contentEncoding);
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

//                 let regionWriter = bufferWriter.subWriter();
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


// export default function scope(name, factory = [name, name = null][0]) {
//     return annotate(v => `scope: ${name}`, new class ScopeEncoding extends Encoding {
//         read(bufferReader, value) {
//             let regions = new Array(factory.length).fill().map(() => region(name));
//             return Encoding.check(factory(...regions)).read(bufferReader, value);
//         }
//         write(bufferWriter, value) {
//             let regions = new Array(factory.length).fill().map(() => region(name));
//             Encoding.check(factory(...regions)).write(bufferWriter, value);
//         }
//     });
// }

