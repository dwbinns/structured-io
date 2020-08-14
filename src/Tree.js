const lineChar = [
    ' ╴╶─',
    '╵┘└┴',
    '╷┐┌┬',
    '│┤├┼',
].join('')


function lines(left, right, top, bottom) {
    return lineChar[(left ? 1 : 0) + (right ? 2 : 0) + (top ? 4 : 0) + (bottom ? 8 : 0)];
}



module.exports = class Tree {
    constructor(text, children = []) {
        this.children = children;
        this.text = text;
    }
    renderLines() {
        return [
            this.text,
            ...this.children
                .flatMap((child, childIndex) =>
                    child.renderLines().map((line, lineIndex) =>
                        lines(
                            false,
                            lineIndex == 0,
                            lineIndex == 0 || childIndex < this.children.length - 1,
                            childIndex < this.children.length - 1,
                        ) +
                        lines(
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