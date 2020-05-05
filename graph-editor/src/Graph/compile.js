import { getFilePath } from "../useFile";
import AdmZip from "adm-zip";
const fs = window.require("fs");
const path = window.require("path");

/*
function resolveInput(graph, port) {
    let { links, ports, nodes } = graph;
    let sourceName = null;

    if (port in links) {
        let sourcePortKey = links[port];
        let sourceNodeKey = ports[sourcePortKey].node;
        let sourceNode = nodes[sourceNodeKey];
        sourceName = sourceNode.name;
    }

    return sourceName;
}

function resolveInputs(graph, inputs) {
    let result = {};

    for (let key of inputs) {
        let {label} = graph.ports[key];
        let sourceName = resolveInput(graph, key);
        result[label] = sourceName;
    }

    return result;
}


function compileNode(graph, params, node) {
    const sideMap = {front: "front", back: "back", edit: "resources", data: "resources"};
    const nodeTypeMap = {front: "code", back: "code", edit: "data", data: "data"};

    let side = sideMap[node.type];

    let data = {
        name: node.name,
        side,
        nodeData: {
            type: nodeTypeMap[node.type]
        }
    }

    let filePath = getFilePath(node.name, node.type, graph.path);
    
    if (filePath)
        data.nodeData.file = fs.readFileSync(filePath, "utf-8");

    if (node.type === "edit")
        data.nodeData.file = JSON.stringify(params, null, 2);

    if (data.nodeData.type === "code")
        data.nodeData.inputs = resolveInputs(graph, node.inputs);

    return data;
}


function applyPrefixes(nodes, prefix) {
    let newDict = {};

    for (let [name, node] of Object.entries(nodes)) {
        for (let [label, inputNode] of Object.entries(node.inputs || [])) {
            node.inputs[label] = prefix + inputNode;
        }

        newDict[prefix + name] = node;
    }

    return newDict;
}

function applyAliasing(name, aliases) {
    return name in aliases ? aliases[name] : name;
}

function applyAliasings(nodes, aliases) {
    console.log(nodes, aliases);

    for (let node of Object.values(nodes)) {
        if (node.type !== "code")
            continue;

        for (let [label, source] of Object.entries(node.inputs)) {
            node.inputs[label] = applyAliasing(source, aliases);
        }
    }
}

function compileSubGraph(graph, inputs, params, prefix, packZip) {
    let data = {
        meta: {
            name: graph.meta.name,
            author: graph.meta.author,
            description: graph.meta.description
        },
        front: {},
        back: {},
        output: null,
    };

    let packPath = path.join(graph.path, "node_modules");
    if (fs.existsSync(packPath)) {
        for (let file of fs.readdirSync(packPath, {withFileType: true})) {
            packZip.addLocalFolder(path.join(packPath, file), "node_modules/" + file);
        }
    }

    let aliases = {};

    for (let node of Object.values(graph.nodes)) {
        switch (node.type) {
            case "out":
                if (node.inputs.length > 0)
                    data.output = resolveInput(graph, node.inputs);
                break;
                
            case "front":
            case "back":
            case "data":
            case "edit":
                let {side, name, nodeData} = compileNode(graph, params, node);

                if (["resources", "front"].includes(side))
                    data.front[name] = nodeData;
                if (["resources", "back"].includes(side))
                    data.back[name] = nodeData;
                break;

            case "graph":
                let subGraphInputs = resolveInputs(graph, node.inputs);
                let subGraphData = JSON.parse(fs.readFileSync(node.path, "utf8"));
                let subGraphParams = node.parameters;
                subGraphData.path = path.dirname(node.path);

                let subGraph = compileSubGraph(subGraphData, subGraphInputs, subGraphParams, prefix + node.name + ".", packZip);
                
                data.front = { ...data.front, ...subGraph.front };
                data.back = { ...data.back, ...subGraph.back };
                aliases[node.name] = subGraph.output;
                break;

            case "in":
                aliases[node.name] = inputs[node.name];
                break;

            default:
                break;
        }
    }
    
    //Resolve all aliases from in and graph nodes
    applyAliasings(data.front, aliases);
    applyAliasings(data.back, aliases);
    data.output = applyAliasing(data.output, aliases);
    
    // Apply Prefix
    if (prefix !== "") {
        data.front = applyPrefixes(data.front, prefix);
        data.back = applyPrefixes(data.back, prefix);
        data.output = prefix + data.output;
    }
    console.log(data);
    return data;
}

function compileGraph(graph, packZip) {
    return compileSubGraph(graph, {}, null, "", packZip);
}
*/

function compileApp(graph) {
    let zip = new ZipBetter();
    return compileGraph(graph, zip);
}

function compileGraph(graph, zip) {
    // Make Graph Folder
    let folder = zip.makeDir(graph.meta.name);

    // Add Node Modules
    let packPath = path.join(graph.path, "node_modules");
    if (fs.existsSync(packPath))
        folder.addLocalFolder(packPath);

    // Add Meta.json
    let meta = {
        name: graph.meta.name,
        author: graph.meta.author,
        description: graph.meta.description
    };

    folder.addFile("meta.json", JSON.stringify(meta, null, 2));

    // Add Nodes

    let subgraphs = folder.addFolder("subgraphs");
    let front = folder.addFolder("front");
    let back = folder.addFolder("back");

    let gData = {
        nodes: {},
        output: null
    };

    for (let [key, node] in Object.entries(graph.nodes)) {
        if (node.type === "out") {
            gData.output = resolveInput(graph, node.inputs);
        }
        else if (node.type === "in") {
            gData.nodes = {"type": "in", "label": node.name}
        }
        else if (node.type in ["front", "back"]) {
            let srcPath = getFilePath(node.name, node.type, graph.path);
            let side = sideMap[node.type];

            side.importFile(srcPath, path.basename(srcPath));

            gData.nodes[node.name] = {
                type: "code",
                inputs: resolveInputs(graph, node.inputs)
            };
            break;
        }
        else if (node.type === "data") {
            let dataPath = getFilePath(node.name, node.type, graph.path);
            let value = fs.readFileSync(dataPath).toString();

            // TODO dont import into both sides, could have security issues
            let nodeData = {type: "data", value}
            gData.nodes[node.name] = nodeData;
            break;
        }
        else if (node.type === "edit") {
            let nodeData = {type: "edit"};

            // TODO dont import into both sides, could have security issues
            gData.nodes[node.name] = nodeData;
        }
        else if (node.type === "graph") {
            let subgraphData = JSON.parse(fs.readFileSync(node.path, "utf8"));
            compileGraph(subgraphData, subgraphs);
            
            let nodeData = {type: "graph", inputs: resolveInputs(graph, node.inputs), graphName: subgraphData.meta.name};
            gData.nodes[node.name] = nodeData;
        }
    }

    let [frontNodes, backNodes] = resolveSides(gData.nodes);

    folder.addFile("_index.js", compileIndex(gData.nodes));
    front.addFile("_graph.json", compileGraphInfo(gData.nodes));
}

function compileIndex(nodes) {
    let content = "";
    for (let [name, nodeData] of Object.entries(nodes)) {
        content += `\t"${name}": `;
        if (nodeData.type === "data")
            content += nodeData.value + ",\n";
        if (nodeData.type in ["front", "back"])
            content += `require('${name}'),\n`;
    }
    
    return "module.exports = {\n" + content + "};\n";
}

function compileGraphInfo(nodes) {
    let content = "";
    let info = {};

    for (let [name, nodeData] of Object.entries(nodes)) {
        if (nodeData.type === "data")
            info[name] = {};

        content += `\t"${name}": `;
        if (nodeData.type === "data")
            content += nodeData.value + ",\n";
        if (nodeData.type in ["front", "back"])
            content += `require('${name}'),\n`;
    }
    
    return "module.exports = {\n" + content + "};\n";
}

function resolveInput(graph, port) {
    let { links, ports, nodes } = graph;
    let sourceName = null;

    if (port in links) {
        let sourcePortKey = links[port];
        let sourceNodeKey = ports[sourcePortKey].node;
        let sourceNode = nodes[sourceNodeKey];
        sourceName = sourceNode.name;
    }

    return sourceName;
}

function resolveInputs(graph, inputs) {
    let result = {};

    for (let key of inputs) {
        let {label} = graph.ports[key];
        let sourceName = resolveInput(graph, key);
        result[label] = sourceName;
    }

    return result;
}

class ZipBetter {
    constructor(scope, zip) {
        this.scope = scope || "";
        this.zip = zip || new AdmZip();
    }

    nameToPath(name) {
        return this.scope + (name.endsWith("/") ? "" : "/");
    }

    addFile(name, content) {
        this.zip.addFile(this.nameToPath(name), content);
    }

    addFolder(name) {
        let path = this.nameToPath(name);
        this.zip.addFile(path, "");
        return ZipBetter(path, this.zip);
    }

    importFolder(localPath, zipName) {
        let zipPath = this.nameToPath(zipName);
        this.zip.addLocalFolder(localPath, zipPath);
    }

    importFile(localPath, zipName) {
        let zipPath = this.nameToPath(zipName);
        this.zip.addLocalFile(localPath, zipPath);
    }
}

export default compileApp;
