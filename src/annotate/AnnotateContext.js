const Tree = require("../Tree");
const tty = require("tty");

const useColour = tty.isatty();
const red = useColour ? '\x1b[31m' : '';
const green = useColour ? '\x1b[32m' : '';
const yellow = useColour ? '\x1b[33m' : '';
const blue = useColour ? '\x1b[34m' : '';
const magenta = useColour ? '\x1b[35m' : '';
const cyan = useColour ? '\x1b[36m' : '';
const normal = useColour ? '\x1b(B\x1b[m' : '';


class AnnotationNode {
    constructor(parent, bufferReader, text, location) {
        this.parent = parent;
        this.bufferReader = bufferReader;
        this.start = this.bufferReader.index;
        this.children = [];
        this.text = text;
        this.location = location;
    }


    format(from, to) {
        return yellow
            + [...this.bufferReader.uint8array.subarray(from, to)]
                .map(v => v.toString(16).padStart(2, '0'))
                .join(" ")
            + normal;
    }

    formatLocation() {
        return blue + this.location + normal;
    }

    toTree() {
        if (!this.children.length) {
            return new Tree(this.text + ": [" + this.format(this.start, this.end)+"] " + this.formatLocation());
        }

        let children = [];
        let position = this.start;
        for (let child of this.children) {
            if (position < child.start) children.push(new Tree(this.format(position, child.start)));
            children.push(child.toTree());
            position = child.end;
        }

        if (position < this.end) children.push(new Tree(this.format(position, this.end)));

        return new Tree(`${this.text} ${this.formatLocation()}`, children);
    }


    finish(text = this.text) {
        this.text = text;
        this.end = this.bufferReader.index;
    }
}

module.exports = class AnnotateContext {
    static symbol = Symbol("AnnotationContext");

    constructor(bufferReader, text, location) {
        this.root = this.node = new AnnotationNode(null, bufferReader, text, location)
    }

    toTree() {
        return this.root.toTree();
    }

    child(bufferReader, text, location) {
        let child = new AnnotationNode(this.node, bufferReader, text, location);
        this.node.children.push(child);
        this.node = child;
    }

    finish(text) {
        this.node.finish(text);
        this.node = this.node.parent;
    }
}