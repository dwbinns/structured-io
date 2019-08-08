const configure = require("./configure");

module.exports = {
    bigEndian: (where, content) => configure(where, {littleEndian: false}, content),
    littleEndian: (where, content) => configure(where, {littleEndian: true}, content),
};
