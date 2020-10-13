import obsidian from 'obsidian';
import testMod from './test.js';

let engine = new obsidian.Engine(null, () => {}, {}, {
    root: "test",
    name: "test",
    functions: {
        "test": {
            name: "",
            type: "code",
            inputs: {},
            functionId: "test",
            module: testMod
        }
    }
}, true);

async function main() {
    await engine.test();

    let data = testMod.__data;
    console.log("\n-=(#)=-");
    console.log(JSON.stringify(data));
}

main();