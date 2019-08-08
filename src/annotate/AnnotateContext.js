const {min, max, ceil} = Math;

class AnnotateContext {
    constructor(bufferReader) {
        this.bufferReader = bufferReader;
        this.start = this.bufferReader.index;
        this.children = [];
        this.text = '';
        this.defined = '';
    }

    format(from, to, indent, text, defined) {
        return new Array(max(1, ceil((to - from) / 8)))
            .fill(0)
            .map((_, line) => [...this.bufferReader.uint8array.subarray(from + line * 8, min(to, from + (line + 1) * 8))]
                .map(v => v.toString(16).padStart(2, '0'))
                .join(" ")
                .padEnd(8*3)
            )
            .join("\n")
            + (indent + text).padEnd(40)
            + defined;
    }

    toText(indent = '') {
        let first = true;
        let position = this.start;
        //console.log(this.text, this.start, this.end);
        let results = [];
        for (let child of this.children) {
            if (position < child.start || first) results.push(this.format(position, child.start, indent, this.text, this.defined));
            results.push(child.toText(indent + "  "));
            position = child.end;
            first = false;
        }
        if (position < this.end) results.push(this.format(position, this.end, indent, this.text, this.defined));
        return results.join("\n");
    }

    child(bufferReader) {
        let child = new AnnotateContext(bufferReader);
        this.children.push(child);
        return child;
    }

    end(text, defined) {
        this.text = text;
        this.defined = defined;
        this.end = this.bufferReader.index;
    }
}

module.exports = AnnotateContext;