const Annotator = require("./Annotator");

// function annotate(annotator, encodingClass) {
//     if (typeof encodingClass != "function" || !encodingClass.prototype) {
//         throw new Error(`Not a class: ${encodingClass}`);
//     }

//     function create(...args) {
//         return new Annotator((v) => annotator(v, ...args), new encodingClass(...args))
//     }

//     function internal(...args) {
//         return new encodingClass(...args);
//     }

//     create.internal = internal;

//     return create;
// };

// module.exports = annotate;

//module.exports = (annotation, encodingClass) => (...args) => new Annotator(annotation, new encodingClass(...args));

module.exports =
    (annotation, encodingClass) =>
        (...args) =>
            new Annotator(annotation, new encodingClass(...args));