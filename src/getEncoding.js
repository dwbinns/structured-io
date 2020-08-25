const Encoding = require("./Encoding");
const instance = require("./encodings/instance");

module.exports = specification => {
    if (specification instanceof Encoding) return specification;
    if (specification && specification.encoding instanceof Encoding) return instance(specification);
    return Encoding.check(specification);
}