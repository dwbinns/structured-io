

class Encoding {
    read(bufferReader, context, value) {}
    write(bufferWriter, context, value) {}

    static ofClass(constructor) {
        return new OfClass(constructor);
    }

    static get(definition) {
        if (definition && definition.encoding) {
            return Encoding.ofClass(definition);
        } 
        if (definition instanceof Encoding) {
            return definition;
        }

        throw new NotAnEncoding(`Not an encoding: ${definition}`);
    }

    static getAll(components) {
        return components.map(Encoding.get);
    }

    
}

class NotAnEncoding extends Error {
    constructor(message) {
        super(message);
        this.captured = false;
    }
}

class OfClass extends Encoding {
    constructor(constructor, encoding = constructor.encoding) {
        super();
        this.constructor = constructor;
        if (!(encoding instanceof Encoding)) {
            throw new NotAnEncoding(`Not an encoding for class ${constructor.name}`);
        }
        this.encoding = encoding;
    }

    read(bufferReader, context, value) {
        value = value || new this.constructor();
        this.encoding.read(bufferReader, context, value);
        return value;
    }
    write(bufferWriter, context, value) {
        this.encoding.write(bufferWriter, context, value);
    }
}



Encoding.NotAnEncoding = NotAnEncoding;

module.exports = Encoding;