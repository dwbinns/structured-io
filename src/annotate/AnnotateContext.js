import { yellow, blue, cyan, green } from "@dwbinns/terminal/colour";

let serial = 0;

class AnnotationNode {
    constructor(parent, bufferReader, text, location) {
        this.parent = parent;
        this.bufferReader = bufferReader;
        this.start = this.bufferReader.index;
        this.childNodes = [];
        this.text = text;
        this.location = location;
        this.serial = serial++;
    }


    format(from, to) {
        if (from == to) return "";
        return "<" + yellow(
            [...this.bufferReader.uint8array.subarray(from, to)]
                .map(v => v.toString(16).padStart(2, '0'))
                .join(":")
        ) + ">";
    }

    formatLocation() {
        return blue(this.location);
    }

    get firstChildStart() {
        let firstInline = this.childNodes.filter(child => child.bufferReader.uint8array == this.bufferReader.uint8array)[0];
        return firstInline ? firstInline.start : this.end;
    }

    toString() {
        return `${cyan(this.text)} ${green(this.value)} ${this.format(this.start, this.firstChildStart)} ${this.formatLocation()}`;
    }

    get children() {
        let children = [];
        let position = this.firstChildStart;
        for (let child of this.childNodes) {
            const inline = child.bufferReader.uint8array == this.bufferReader.uint8array;
            if (inline && position < child.start) {
                children.push(this.format(position, child.start));
            }
            children.push(child);
            if (inline) position = child.end;
        }
        if (position < this.end) {
            children.push(this.format(position, this.end));
        }
        return children;
    }

    finish(value) {
        this.value = value;
        this.end = this.bufferReader.index;
    }
}



export default class AnnotateContext {
    static symbol = Symbol("AnnotationContext");

    getCurrentNode() {
        return this.node;
    }

    restore(currentNode) {
        this.node = currentNode;
    }

    child(bufferReader, text, location) {
        let child = new AnnotationNode(this.node, bufferReader, text, location);
        if (!this.node) this.root = child;
        //else this.node.children.push(child);
        this.node = child;
        return child;
    }

    finish(value, child) {
        if (child.parent) child.parent.childNodes.push(child);
        child.finish(value);
        this.node = child.parent;
    }
}