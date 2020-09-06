const { readFileSync } = require("fs");
const { join, dirname } = require("path");

let readme = readFileSync(join(dirname(__dirname), "README.md"), { encoding: "utf8" });
let regex = /```JavaScript(.*?)```/sg;
for (let match; match = regex.exec(readme);) {
    console.log(match[1]);
    (new Function("require", match[1]))(() => require(".."));
}
