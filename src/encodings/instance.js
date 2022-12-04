import Annotated from "../annotate/Annotated.js";
import Encoding from "../Encoding.js";
import { BufferReader } from "buffer-io";
import AnnotateContext from "../annotate/AnnotateContext.js";
import { getLocation, wrap } from '../capture.js';

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
        return value.explain ? value.explain() : "";
    }
    decode(value, context) {
        if (value.decodeContent) {
            let parentNode = context.getCurrentNode();
            try {
                let [data, encoding] = value.decodeContent();
                let reader = new BufferReader(data);
                reader.setContext(AnnotateContext.symbol, context);
                let node = context.child(reader, "decode", getLocation());
                Encoding.check(encoding).read(reader, context);
                context.finish("decode", node);
                context.restore(parentNode);
            } catch (e) {
                return;
            }

        }
    }
}

export default wrap((...args) => new Instance(...args));