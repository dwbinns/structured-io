const Encoding = require("../Encoding");
const Definition = require("../definitions/Definition");
const { getLocation } = require("../capture");


class Define extends Encoding {
    constructor(factory) {
        super();
        this.factory = factory;
        this.location = getLocation();
    }

    makeContent() {
        return this.factory(
            ...new Array(this.factory.length).fill(0).map((_, index) => new Definition(this.location, index))
        );
    }

    read(bufferReader, value) {
        return this.makeContent().read(bufferReader, value);
    }

    write(bufferWriter, value) {
        this.makeContent().write(bufferWriter, value);
    }
}

module.exports = (...args) => new Define(...args);
