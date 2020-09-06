const Tree = require("../Tree");
const tty = require("tty");

const useColour = process.stdout.isTTY;

const red = useColour ? '\x1b[31m' : '';
const green = useColour ? '\x1b[32m' : '';
const yellow = useColour ? '\x1b[33m' : '';
const blue = useColour ? '\x1b[34m' : '';
const magenta = useColour ? '\x1b[35m' : '';
const cyan = useColour ? '\x1b[36m' : '';
const normal = useColour ? '\x1b[m' : '';

let serial = 0;

class AnnotationNode {
    constructor(parent, bufferReader, text, location) {
        this.parent = parent;
        this.bufferReader = bufferReader;
        this.start = this.bufferReader.index;
        this.children = [];
        this.text = text;
        this.location = location;
        this.serial = serial++;
    }


    format(from, to) {
        return yellow
            + [...this.bufferReader.uint8array.subarray(from, to)]
                .map(v => v.toString(16).padStart(2, '0'))
                .join(":")
            + normal;
    }

    formatLocation() {
        return blue + this.location + normal;
    }

    toTree() {
        let children = [];
        let position = this.start;
        let firstChildStart = position;
        for (let child of this.children) {
            const inline = child.bufferReader.uint8array == this.bufferReader.uint8array;
            if (inline && position < child.start) {
                if (position == this.start) firstChildStart = child.start;
                else children.push(new Tree(this.format(position, child.start)));
            }
            children.push(child.toTree());
            if (inline) position = child.end;
        }
        if (position == this.start) position = firstChildStart = this.end;
        if (position < this.end) children.push(new Tree(this.format(position, this.end)));

        return new Tree(`${this.text} <${this.format(this.start, firstChildStart)}> ${this.formatLocation()}`, children);
        //return new Tree(`${this.text} ${this.formatLocation()}`, children);
    }


    finish(text = this.text) {
        this.text = text;
        this.end = this.bufferReader.index;
    }
}



module.exports = class AnnotateContext {
    static symbol = Symbol("AnnotationContext");

    getCurrentNode() {
        return this.node;
    }

    restore(currentNode) {
        this.node = currentNode;
    }

    toTree() {
        return this.root.toTree();
    }

    child(bufferReader, text, location) {
        let child = new AnnotationNode(this.node, bufferReader, text, location);
        if (!this.node) this.root = child;
        //else this.node.children.push(child);
        this.node = child;
        return child;
    }

    finish(text, child) {
        if (child.parent) child.parent.children.push(child);
        child.finish(text);
        this.node = child.parent;
    }
}