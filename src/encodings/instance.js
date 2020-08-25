
const annotate = require("../annotate");
const Annotated = require("../annotate/Annotated");
const Encoding = require("../Encoding");

class Instance extends Annotated {
    constructor(classType, encoding = classType.encoding) {
        super(`instance: ${classType.name}`);
        classType.prototype.constructor;
        this.classType = classType;
        this.encoding = Encoding.check(encoding);
    }
    read(bufferReader, value) {
        return this.encoding.read(bufferReader, new this.classType());
    }
    write(bufferWriter, value) {
        this.encoding.write(bufferWriter, value);
    }
    explain(value) {
        return "";
    }
}

module.exports = (...args) => new Instance(...args);