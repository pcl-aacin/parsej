import * as fs from "fs";

console.log("I'm in", fs.realpathSync(""));
console.log(await new Promise(okay => okay("Hello World!")));
console.log("Oh! Now is", time);

export default fs.realpathSync("");