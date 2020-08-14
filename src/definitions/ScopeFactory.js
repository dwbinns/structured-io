const Scope = require("./Scope");
const Encoding = require("../Encoding");

class ScopeFactory {
    constructor(definition) {
        if (typeof definition === "number") {
            this.number = definition;
        } else if (definition instanceof Encoding) {
            this.encoding = definition;
        } else if (definition.getScope) {
            this.definition = definition;
        } else {
            throw new Encoding.NotAnEncoding("Not an encoding or a definition");
        }
    }

    getReadScope(bufferReader, context) {
        if (this.definition) return this.definition.getScope();
        
        let scope = new Scope();
        if (this.number) scope.set(this.number);
        else scope.set(this.encoding.read(bufferReader, context));
        return scope;
    
    }

    getWriteScope(bufferWriter, context) {
        if (this.definition) return this.definition.getScope();

        

        
        let scope = new Scope();
        if (this.number) {
            scope.listen((value) => {
                if (value != this.number) throw new Error(`Value wrong, expected ${this.number} found ${value}`);
            });
        } else {
            let here=bufferWriter.nestedWriter();
            this.encoding.write(bufferWriter, context, 0);

            scope.listen((value) => {
                this.encoding.write(here, context, value);
            });
        }
        return scope;
    }
}

module.exports = ScopeFactory;