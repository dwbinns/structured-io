const Annotated = require("./Annotated");

class AnnotatedValue extends Annotated {
    explain(value) {
        return value.toString();
    }
}

module.exports = AnnotatedValue