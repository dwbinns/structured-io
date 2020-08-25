const getEncoding = require("../getEncoding");
const Definition = require("../definitions/Definition");
const Annotated = require("../annotate/Annotated");

class Condition extends Annotated {
    constructor(condition, conditionalContent) {
        this.contentEncoding = getEncoding(conditionalContent);
        this.condition = condition;
    }

    read(bufferReader, value) {
        let conditionDefinition = Definition.read(this.condition, bufferReader);
        return conditionDefinition.get() ? this.contentEncoding.read(bufferReader, value) : null;
    }
    write(bufferWriter, value) {
        let conditionDefinition = Definition.write(this.condition, bufferWriter);

        conditionDefinition.set(value ? 1 : 0);
        if (value) {
            this.contentEncoding.write(bufferWriter, value);
        }
    }

}

module.exports = (...args) => new Condition(...args);
