const {readdirSync} = require("fs");

for (let file of readdirSync(__dirname)) {
    if (file != "index.js") {
        console.log((file + " ").padEnd(process.stdout.columns, "="));
        try {
            require(`./${file}`);
            console.log("pass ".padEnd(process.stdout.columns, "="));
        } catch (e) {
            console.log(e);
            console.log("fail ".padEnd(process.stdout.columns, "="));
            process.exitCode = 1;
        }
    }
}
