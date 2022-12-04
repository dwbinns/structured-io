function capture(fn, args) {
    return fn(...args);
}

export function getLocation() {
    let prior = Error.prepareStackTrace;
    let target = {};
    Error.prepareStackTrace = (e, s) => s;
    Error.captureStackTrace(target, capture);
    let callerStack = target.stack.length > 1 && target.stack[1];
    Error.prepareStackTrace = prior;
    let location = "-";
    if (callerStack) {
        let fileName = callerStack.getFileName();
        let where = fileName ? fileName : callerStack.getEvalOrigin();
        location = `${where}:${callerStack.getLineNumber()}:${callerStack.getColumnNumber()}`;
    }

    return location;
}

export function wrap(fn) {
    let wrapped = (...args) => capture(fn, args);
    wrapped.original = fn;
    return wrapped;
}




