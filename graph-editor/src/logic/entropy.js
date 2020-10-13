import buildProject from './compileProject';
import protobuf from 'protobufjs';
import { util } from 'obsidian';
var zlib = window.require('zlib');

function projectEntropy(loaded, projectId) {
    let results = buildProject(loaded, projectId);
    let project = results[2][results[1]].data;

    let root = protobuf.Root.fromJSON(projectBuf);
    console.log(root);

    let lookup = { vals: {}, counter: 0 };
    let cleanProject = {
        name: project.name,
        functions: {}
    };

    for (let [k, v] of Object.entries(project.functions)) {
        let k2 = remap(lookup, k);
        cleanProject.functions[k2] = {
            type: v.type,
            sides: v.sides.join(),
            inputs: util.transform(v.inputs, v => remap(lookup, v)),
            content: v.content,
            parameters: v.parameters && JSON.stringify(v.parameters),
            root: v.root && remap(lookup, v.root)
        }
    }

    let msg = root.lookup("project")
    let buf = msg.encode(cleanProject).finish();

    console.log(cleanProject);
    let trueEntropy = zlib.deflateRawSync(buf, { level: 6 }).byteLength * 8;
    let size = buf.length * 8;

    return [
        trueEntropy,
        size,
        Math.round((size - trueEntropy) / size * 100) + "% shrinkage"
    ];
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
