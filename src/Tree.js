const lineChar = [
    ' ╴╶─',
    '╵┘└┴',
    '╷┐┌┬',
    '│┤├┼',
].join('')

const roundedLineChar = [
    ' ╴╶─',
    '╵╯╰┴',
    '╷╮╭┬',
    '│┤├┼',
].join('')




function box(left, right, top, bottom) {
    return roundedLineChar[(left ? 1 : 0) + (right ? 2 : 0) + (top ? 4 : 0) + (bottom ? 8 : 0)];
}

function * split(input) {
    while (input.length) {
        if (input[0] == "\x1b" && input.length > 1) {
            let length = 2;
            if (input[1] == "O" && input.length > 2) length = 3;
            if (input[1] == "[") {
                while (length < input.length && input[length++] < "@") {}
            }
            yield input.slice(0, length);
            input = input.slice(length);
            continue;
        } else {
            let length = 0;
            while (length < input.length && input[length] > " " && input[length] != ":") {
                length ++;
            }
            if (length == 0) length = 1;
            yield input.slice(0, length);
            input = input.slice(length);
        }
    }
}

const normal = '\x1b[m';


function * wrap(text, width) {
    let line = "";
    let length = 0;
    let escapes = ""
    for (let component of [...split(text)]) {
        let isEscape = component[0] < " ";
        let componentLength = isEscape ? 0 : component.length;
        if (length + componentLength >= width) {
            yield line + normal;
            line = escapes;
            length = 0;
        }
        line += component;
        length += componentLength;
        escapes += isEscape ? component : "";

    }
    if (length > 0) yield line;
}


module.exports = class Tree {
    constructor(text, children = []) {
        this.children = children;
        this.text = text;
    }
    renderLines(maxWidth = process.stdout.isTTY ? process.stdout.columns : Infinity) {
        return [
            ...[...wrap(this.text, maxWidth - 2)]
                .map((line, index, lines) =>
                    box(index == 0, index == 0, index > 0 && this.children.length, this.children.length) +
                    " " +
                    line
                ),
            ...this.children
                .flatMap((child, childIndex) =>
                    child.renderLines(maxWidth - 2).map((line, lineIndex) =>
                        box(
                            false,
                            lineIndex == 0,
                            lineIndex == 0 || childIndex < this.children.length - 1,
                            childIndex < this.children.length - 1,
                        ) +
                        box(
                            lineIndex == 0,
                            lineIndex == 0,
                            false,
                            false,
                        ) +
                        line
                    )
                )
        ];
    }
}