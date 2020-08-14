const Encoding = require("./Encoding");
const instance = require("./encodings/instance");

module.exports = specification => {
    if (specification instanceof Encoding) return specification;
    if (specification.encoding instanceof Encoding) return instance(specification);
    throw new Error("Not an encoding");
};
