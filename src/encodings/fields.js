const field = require("./field");
const sequence = require("./sequence");

module.exports = (definitions) => sequence(
    ...Object.entries(definitions)
        .map(([key, value]) => field(key, value))
);

