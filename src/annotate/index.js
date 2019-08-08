const Annotator = require("./Annotator");

function annotate(annotator, encodingClass) {
    if (typeof encodingClass != "function" || !encodingClass.prototype) {
        throw new Error(`Not a class: ${encodingClass}`);
    }

    function create(where, ...args) {
        return new Annotator(where, (v) => annotator(v, ...args), new encodingClass(...args))
    } 

    return create;
};

module.exports = annotate;