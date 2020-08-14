const Tree = require("../Tree");

module.exports = class AnnotateContext {
    constructor(bufferReader, text) {
        this.bufferReader = bufferReader;
        this.start = this.bufferReader.index;
        this.children = [];
        this.text = text;
    }


    format(from, to) {
        return [...this.bufferReader.uint8array.subarray(from, to)]
            .map(v => v.toString(16).padStart(2, '0'))
            .join(" ");
    }

    toTree() {
        if (!this.children.length) {
            return new Tree(this.text + ": [" + this.format(this.start, this.end)+"]");
        }

        let children = [];
        let position = this.start;
        for (let child of this.children) {
            if (position < child.start) children.push(new Tree(this.format(position, child.start)));
            children.push(child.toTree());
            position = child.end;
        }

        if (position < this.end) children.push(new Tree(this.format(position, this.end)));

        return new Tree(this.text, children);
    }

    child(bufferReader, text) {
        let child = new AnnotateContext(bufferReader, text);
        this.children.push(child);
        return child;
    }

    finish(text) {
        this.text = text;
        this.end = this.bufferReader.index;
    }
}