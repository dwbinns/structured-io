const ScopeFactory = require("../definitions/ScopeFactory");
const Encoding = require("../Encoding");
const annotate = require("../annotate");
const getEncoding = require("../getEncoding");

class Type extends Encoding {
    constructor(type, options, defaultClass, defaultField = "code") {
        super();
        if (defaultClass && typeof defaultClass != "function") throw new Error("DefaultClass is not a function");
        this.defaultField = defaultField;
        this.defaultClass = defaultClass;
        this.type = new ScopeFactory(type);
        Object.values(options).forEach(getEncoding);
        this.codeLookup = new Map(Object.entries(options).map(([code, type])=>[type, Number(code)]));
        this.typeLookup = new Map(Object.entries(options).map(([code, type])=>[Number(code), type]));
    }

    read(bufferReader, context, value) {
        let typeScope = this.type.getReadScope(bufferReader, context);
        let code = typeScope.get();
        let type = this.typeLookup.get(code);
        let instance;
        if (!type) {
            if (!this.defaultClass) throw new Error(`Unknown code ${code}`);
            instance = new this.defaultClass(code);
        } else {
            instance = new type();
        }
        return instance.constructor.encoding.read(bufferReader, context, instance);
    }
    write(bufferWriter, context, value) {
        let typeScope = this.type.getWriteScope(bufferWriter, context);

        let code;
        if (this.defaultClass && value instanceof this.defaultClass) {
            code = value[this.defaultField];
        } else {
            if (!this.codeLookup.has(value.constructor)) throw new Error(`Unknown type ${value.constructor}`);
            code = this.codeLookup.get(value.constructor);
        }
        typeScope.set(code);
        value.constructor.encoding.write(bufferWriter, context, value);
    }
}

module.exports = annotate(v => `type: ${v ? v.constructor.name : "-"}`, Type);

