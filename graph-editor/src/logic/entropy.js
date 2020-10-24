import buildProject from './compileProject';
import protobuf from 'protobufjs';
import { util } from 'obsidian';
var zlib = window.require('zlib');

function projectEntropy(loaded, projectId) {
    let results = buildProject(loaded, projectId);
    let project = results[2][results[1]].data;

    let root = protobuf.Root.fromJSON(projectBuf);

    let lookup = { vals: {}, counter: 0 };
    let cleanProject = {
        name: project.name,
        functions: {}
    };

    let strings = { [project.name]: 1};
    for (let [k, v] of Object.entries(project.functions)) {
        let k2 = remap(lookup, k);
        let sides = v.sides.join("");
        let inputs = util.transform(v.inputs, v => remap(lookup, v));

        cleanProject.functions[k2] = {
            type: v.type,
            sides: recordString(strings, sides),
            inputs,
            content: v.content && recordText(strings, v.content),
            parameters: v.parameters && recordText(strings, JSON.stringify(v.parameters)),
            root: v.root && remap(lookup, v.root)
        }

        for (let k of Object.keys(inputs))
            recordString(strings, k);
    }
    let sortedStrings = Object.entries(strings).sort((a, b) => a[1] - b[1]);
    let dictionary = Buffer.from(sortedStrings.map(x => x[0]).join(""), 'utf8');

    let msg = root.lookup("project")
    let buf = msg.encode(cleanProject).finish();

    let trueEntropy = zlib.deflateRawSync(buf, { level: 6, dictionary }).byteLength * 8 ;
    let size = buf.length * 8;

    return [
        // 14.9 is the avg. bits per word in technical docs with zlib-deflate lvl 6. (https://quixdb.github.io/squash-benchmark/)
        // actual ratio: 2.95, theoretical ratio: 3.7
        // Assuming 44 bits per word (5.5 chars) uncompressed, and 11.8 bits ideally
        "It would take at least " + Math.round(trueEntropy / 14.9) + " words to implement this program",
        Math.round(size / 14.9) + " words were actually used."
    ];
}

function recordString(strings, s) {
    strings[s] = s in strings ? strings[s] + 1 : 1;
    return s;
}

function recordText(strings, text) {
    let words = [...text.matchAll(/[a-zA-z]{2,}/g)];
    for (let word of words)
        recordString(strings, word);
    
    return text;
}

function remap(lookup, key) {
    if (!(key in lookup.vals)) {
        lookup.vals[key] = lookup.counter;
        lookup.counter += 1;
    }

    return lookup.vals[key]
}

let projectBuf = {
    nested: {
        project: {
            fields: {
                name: {
                    type: "string",
                    id: 1
                },
                functions: {
                    type: "func",
                    id: 2,
                    map : true,
                    keyType : "int32"
                }
            }
        },

        func: {
            fields: {
                type: {
                    type: "typeEnum",
                    id: 1
                },
                sides: {
                    type: "string",
                    id: 2
                },
                inputs: {
                    map: true,
                    type: "int32",
                    keyType: "string",
                    id: 3
                },
                content: {
                    type: "string",
                    id: 4
                },
                parameters: {
                    type: "string",
                    id: 5
                },
                root: {
                    type: "int32",
                    id: 6
                }
            }
        },

        typeEnum: {
            values: {
                code: 0,
                remote: 1,
                out: 2,
                in: 3,
                edit: 4,
                call: 5,
                data: 6
            }
        }
    }
}

export default { projectEntropy }
