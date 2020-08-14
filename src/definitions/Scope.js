class Scope {
    constructor(index) {
        this.listeners = [];
        this.index = index;
    }

    get() {
        this.checkCalled();
        return this.value;
    }

    set(value) {
        this.value = value;
        this.listeners.forEach(listener => listener(value));
    }

    listen(callback) {
        if (this.value !== undefined) {
            callback(this.value);
        }
        this.listeners.push(callback);
    }

    checkCalled() {
        if (this.value === undefined) {
            throw new Error(`Definition not found, #${this.index}`);
        }
    }
}

module.exports = Scope;