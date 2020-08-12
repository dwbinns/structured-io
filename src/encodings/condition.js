const ScopeFactory = require("../definitions/ScopeFactory");
const Encoding = require("../Encoding");
const annotate = require("../annotate");

class Condition {
    constructor(condition, conditionalContent) {
        this.contentEncoding = Encoding.get(conditionalContent);
        this.condition = new ScopeFactory(condition);
    }

    read(bufferReader, context, value) {
        let sizeScope = this.condition.getReadScope(bufferReader, context);
        return sizeScope.get() ? this.contentEncoding.read(bufferReader, context, value) : null;
    }
    write(bufferWriter, context, value) {
        let sizeScope = this.condition.getWriteScope(bufferWriter, context);
        sizeScope.set(value ? 1 : 0);
        if (value) {
            this.contentEncoding.write(bufferWriter, context, value);
        }
    }
    
}

module.exports = annotate(v => `condition`, Condition);
