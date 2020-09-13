import { Engine } from 'obsidian';
import testMod from './test.js';
//let Engine = require('obsidian').default.Engine;
//let testMod = require("./test.js");

let engine = new Engine(null, () => {}, {}, {
    appData: {
        root: "test",
        name: "test",
    },
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

engine.test();

let data = testMod.__data;
console.log("\n*=#=@=#=@=O=@=#=@=#=*");
console.log(JSON.stringify(data));