import { getFilePath } from "../useFile";
const fs = window.require("fs");
const path = window.require("path");

function resolveInputs(graph, inputs, graphInputs) {
    let { links, ports, nodes } = graph;
    let result = {};

    for (let key of inputs) {
        let {label} = graph.ports[key];
        let sourceName = null;

        if (key in links) {
            let sourcePortKey = links[key];
            let sourceNodeKey = ports[sourcePortKey].node;
            let sourceNode = nodes[sourceNodeKey];

            if (sourceNode.type === "in") {
                sourceName = graphInputs[sourceNode.name];
            }
            else
                sourceName = nodes[sourceNodeKey].name;
        }

        result[label] = sourceName;
    }

    return result;
}


function compileNode(graph, node, graphInputs) {
    const sideMap = {js: "front", py: "back", edit: "resources", data: "resources"};
    const nodeTypeMap = {js: "code", py: "code", edit: "data", data: "data"};

    let filePath = getFilePath(node.name, node.type, graph.path);
    let fileContent = fs.readFileSync(filePath, "utf-8");

    let side = sideMap[node.type];

    let data = {
        name: node.name,
        side,
        nodeData: {
            type: nodeTypeMap[node.type]
        },
        file: fileContent
    }

    if (data.nodeData.type === "code")
        data.nodeData.inputs = resolveInputs(graph, node.inputs, graphInputs);

    return data;
}


function applyPrefix(dictionary, prefix) {
    let newDict = {};

    for (let [name, node] of Object.entries(dictionary))
        newDict[prefix + name] = node;

    return newDict;
}


function compileSubGraph(graph, inputs, prefix) {
    let data = {
        meta: {
            name: graph.meta.name,
            author: graph.meta.author,
            description: graph.meta.description
        },
        front: {},
        back: {},
        files: {
            front: {},
            back: {},
            resources: {}
        },
        output: null
    };

    for (let node of Object.values(graph.nodes)) {
        switch (node.type) {
            case "out":
                let outPort = node.inputs[0];

                if (outPort in graph.links) {
                    let sourcePort = graph.links[outPort];
                    let outNodeKey = graph.ports[sourcePort].node;
                    data.output = graph.nodes[outNodeKey].name;
                }
                
                break;
            case "py":
            case "js":
            case "data":
            case "edit":
                let {side, name, nodeData, file} = compileNode(graph, node, inputs);
                data.files[side][name] = file;
                
                if (side === "resources" || side === "front")
                    data.front[name] = nodeData;
                if (side === "resources" || side === "back")
                    data.back[name] = nodeData;
                
                    break;
            case "graph":
                let subGraphInputs = resolveInputs(graph, node.inputs, inputs);
                let subGraphData = JSON.parse(fs.readFileSync(node.path, "utf8"));
                subGraphData.path = path.dirname(node.path);

                let subGraph = compileSubGraph(subGraphData, subGraphInputs, prefix + node.name + ".");
                
                data.front = { ...data.front, ...subGraph.front };
                data.back = { ...data.back, ...subGraph.back };

                data.files.front = { ...data.files.front, ...subGraph.files.front };
                data.files.back = { ...data.files.back, ...subGraph.files.back };
                data.files.resources = { ...data.files.resources, ...subGraph.files.resources };
                
                break;
            case "in":
            default:
                break;
        }
        
    }
    
    // Apply Prefix
    if (prefix !== "") {
        data.front = applyPrefix(data.front, prefix);
        data.back = applyPrefix(data.back, prefix);
        data.files.front = applyPrefix(data.files.front, prefix);
        data.files.back = applyPrefix(data.files.back, prefix);
        data.files.resources = applyPrefix(data.files.resources, prefix);
    }
    return data;
}

function compileGraph(graph) {
    return compileSubGraph(graph, {}, "");
}

export default compileGraph;