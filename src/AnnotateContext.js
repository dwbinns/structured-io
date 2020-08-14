const Tree = require("./Tree");

const {max, ceil, min} = Math;


// module.exports = class AnnotateContext {
//     constructor(bufferReader) {
//         this.bufferReader = bufferReader;
//         this.start = this.bufferReader.index;
//         this.children = [];
//         this.text = '';
//     }

//     format(from, to, firstLineSuffix, followingLineSuffix) {
//         return new Array(max(1, ceil((to - from) / 8))).fill()
//             .map((_, lineNumber) => [...this.bufferReader.uint8array.subarray(from + lineNumber * 8, min(to, from + (lineNumber + 1) * 8))]
//                 .map(v => v.toString(16).padStart(2, '0'))
//                 .join(" ")
//             )
//             .map((line, index) => line.padEnd(8 * 3) + (index == 0 ? firstLineSuffix : followingLineSuffix))
//             .join("\n");
//     }

//     print(indent = '', childIndent = '') {
//         if (this.end == undefined) return;
//         let first = true;
//         let position = this.children.length ? this.children[0].start : this.end;

//         console.log(this.format(this.start, position, indent + this.text, childIndent + "│"));
//         for (let child of this.children) {
//             if (position < child.start) console.log(this.format(position, child.start, childIndent + "│", childIndent + "│"));
//             child.print(childIndent + "├─", childIndent + "│ ");
//             position = child.end;
//             first = false;
//         }
//         if (position < this.end) console.log(this.format(position, this.end, childIndent + "│", childIndent + "│"));

//     }

//     child(bufferReader) {
//         let child = new AnnotateContext(bufferReader);
//         this.children.push(child);
//         return child;
//     }

//     finish(text) {
//         this.text = text;
//         this.end = this.bufferReader.index;
//     }
// }

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