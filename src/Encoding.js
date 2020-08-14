module.exports = class Encoding {
    static check(encoding) {
        if (!(encoding instanceof Encoding)) {
            throw new Error("Not an encoding");
        }
        return encoding;
    }

    read() { }
    write() { }
};

