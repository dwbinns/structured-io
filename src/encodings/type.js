const getEncoding = require("../getEncoding");
const Definition = require("../definitions/Definition");
const Annotated = require("../annotate/Annotated");

class Type extends Annotated {
    constructor(type, options, defaultClass, defaultField = "code") {
        super("type");
        if (defaultClass && typeof defaultClass != "function") throw new Error("DefaultClass is not a function");
        this.defaultField = defaultField;
        this.defaultClass = defaultClass;
        this.type = type;
        Object.values(options).forEach(getEncoding);
        this.codeLookup = new Map(Object.entries(options).map(([code, type])=>[type, Number(code)]));
        this.typeLookup = new Map(Object.entries(options).map(([code, type])=>[Number(code), type]));
    }

    read(bufferReader, value) {
        let typeDefinition = Definition.read(this.type, bufferReader);
        let code = typeDefinition.get();
        let type = this.typeLookup.get(code);
        let instance;
        if (!type) {
            if (!this.defaultClass) throw new Error(`Unknown code ${code}`);
            instance = new this.defaultClass(code);
        } else {
            instance = new type();
        }
        return instance.constructor.encoding.read(bufferReader, instance);
    }

    write(bufferWriter, value) {
        let typeDefinition = Definition.write(this.type, bufferWriter);

        let code;
        if (this.defaultClass && value instanceof this.defaultClass) {
            code = value[this.defaultField];
        } else {
            if (!this.codeLookup.has(value.constructor)) throw new Error(`Unknown type ${value.constructor}`);
            code = this.codeLookup.get(value.constructor);
        }
        typeDefinition.set(code);
        value.constructor.encoding.write(bufferWriter, value);
    }
}

module.exports = (...args) => new Type(...args);

