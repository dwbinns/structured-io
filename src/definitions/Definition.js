
const { getLocation } = require("../capture");
const Encoding = require("../Encoding");
const instance = require("../encodings/instance");
const getEncoding = require("../getEncoding");

class Attach extends Encoding {
    constructor(definition, contentEncoding) {
        super();

        if (typeof contentEncoding == "function") {
            this.contentTransform = contentEncoding;
        } else {
            this.contentEncoding = getEncoding(contentEncoding);
        }
        this.definition = definition;
    }

    read(bufferReader, value) {
        let result = this.contentEncoding
            ? this.contentEncoding.read(bufferReader, value)
            : this.contentTransform(value);
        this.definition.set(result);
        return result;
    }

    write(bufferWriter, value) {

        if (this.contentEncoding) {
            let here = bufferWriter.here();
            this.contentEncoding.write(bufferWriter);
            this.definition.listen((value) => {
                this.contentEncoding.write(here, value);
            });
        }
    }
}

class Definition {
    constructor(location, index, value) {
        this.location = location;
        this.index = index;

        this.listeners = [];
        this.value = value;

        let definition = contentEncoding => new Attach(definition, contentEncoding);
        Object.assign(definition, this);
        Object.setPrototypeOf(definition, this);
        return definition;
    }


    get() {
        this.checkDefined();
        return this.value;
    }

    set(value) {
        this.value = value;
        this.listeners.forEach(listener => listener(value));
    }

    listen(callback) {
        if (this.value !== undefined) {
            callback(this.value);
        }
        this.listeners.push(callback);
    }

    checkDefined() {
        if (this.value === undefined) {
            throw new Error(`Value not defined, #${this.index} @ ${this.location}`);
        }
    }

    static read(target, bufferReader) {
        if (target instanceof Definition) return target;
        if (target instanceof Encoding) {
            let definition = new Definition(target.location, null);
            definition(target).read(bufferReader);
            return definition;
        }
        if (typeof target === "number") return new Definition(getLocation(), null, target);
        throw new Encoding.NotAnEncoding("Not an encoding or a definition");
    }

    static write(target, bufferWriter) {
        if (target instanceof Definition) return target;
        if (target instanceof Encoding) {
            let definition = new Definition(target.location, null);
            definition(target).write(bufferWriter);
            return definition;
        }
        if (typeof target === "number") return new Definition(null, null, target);
        throw new Encoding.NotAnEncoding("Not an encoding or a definition");
    }


}

module.exports = Definition;