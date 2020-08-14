const transform = require("./transform");

module.exports = function alternative(fieldSpecification, options) {
    let valueLookup = new Map(Object.entries(options).map(([key, value]) => [value, Number(key)]));
    let codeLookup = new Map(Object.entries(options).map(([key, value]) => [Number(key), value]));

    function read(code) {
        if (!codeLookup.has(code)) throw new Error("Unknown code: " + code);
        return codeLookup.get(code);
    }

    function write(value) {
        if (!valueLookup.has(value)) throw new Error("Unknown option: " + value);
        return valueLookup.get(value);
    }

    return transform(fieldSpecification, read, write);
}
