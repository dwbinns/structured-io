const { existsSync } = require("fs");
const { basename, dirname, join } = require("path");

function capture(fn, args) {
    return fn(...args);
}

function getPackageRelative(fileName, extra = "") {
    let next = join(basename(fileName), extra);
    if (existsSync(join(fileName, "package.json"))) return next;
    return getPackageRelative(dirname(fileName), next);
}

function getLocation() {
    let debugStack = new Error().stack;
    let prior = Error.prepareStackTrace;
    let target = {};
    Error.prepareStackTrace = (e, s) => s;
    Error.captureStackTrace(target, capture);
    //console.log(this.stack.join("\n"));
    let callerStack = target.stack.length > 1 && target.stack[1];
    Error.prepareStackTrace = prior;
    let location = "-";
    if (callerStack) {
        let fileName = getPackageRelative(callerStack.getFileName());
        location = `${fileName}:${callerStack.getLineNumber()}:${callerStack.getColumnNumber()}`;
    }

    return location;
}

function wrap(fn) {
    return (...args) => capture(fn, args);
}

module.exports = {wrap, getLocation};
