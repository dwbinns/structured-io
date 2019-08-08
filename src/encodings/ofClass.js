const Encoding = require("../Encoding");
const annotate = require("../annotate");

module.exports = (where, constructor) => Encoding.ofClass(constructor);