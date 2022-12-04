import { BufferReader } from 'buffer-io';
import AnnotateContext from './annotate/AnnotateContext.js';
import { getLocation, wrap } from './capture.js';
import getEncoding from './getEncoding.js';
import tree from "@dwbinns/terminal/tree";


export default wrap(function explain(uint8array, specification, parentContext) {
    let reader = new BufferReader(uint8array);
    let context = parentContext || new AnnotateContext();
    let node = context.child(reader, "explain", getLocation());
    reader.setContext(AnnotateContext.symbol, context);

    let encoding = getEncoding(specification);
    try {
        encoding.read(reader);
    } catch(e) {
        console.log(e);
    } finally {
        context.finish('', node);
        if (!parentContext) console.log(
            tree({
                node: context.root,
                getChildren: node => node.children || []
            })
        );
    }
});
