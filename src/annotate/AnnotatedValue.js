import Annotated from "./Annotated.js";

class AnnotatedValue extends Annotated {
    explain(value) {
        return value.toString();
    }
}

export default AnnotatedValue