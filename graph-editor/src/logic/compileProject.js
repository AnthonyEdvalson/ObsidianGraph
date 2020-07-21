import { ZipBetter } from "./ZipBetter";

const fs = window.require("fs");
const path = window.require("path");

function buildProject(loaded, projectId) {
    let buildData = {};
    let project = loaded[projectId];

    let startup = project.startup || Object.entries(project.graphs).find(g => g[1].present.meta.name.toLowerCase() === "main")[0];

    if (!startup)
        throw new Error("Cannot build " + project.name + ". It has no startup graph");

    let rootLocation = buildGraph(loaded, buildData, projectId, startup);
    console.log(buildData);
    
    let zip = new ZipBetter();

    for (let [name, project] of Object.entries(buildData)) {
        let projectFolder = zip.addFolder(name);

        if (project.frontNodeModulesPath)
            projectFolder.importFolder(project.frontNodeModulesPath, "front_node_modules");
        
        if (project.backNodeModulesPath)
            projectFolder.importFolder(project.backNodeModulesPath, "back_node_modules");

        projectFolder.addFile("project.json", JSON.stringify(project.data, null, 2));
    }

    let appData = {
        root: rootLocation,
        projects: Object.keys(buildData),
        name: project.name,
        author: project.author,
        description: project.description
    };

    zip.addFile("app.json", JSON.stringify(appData, null, 2));

    return [zip, project.name];
}

function buildGraph(loaded, buildData, projectId, graphId) {
    let project = loaded[projectId];
    let graph = project.graphs[graphId].present;
    let name = project.name

    if (!(name in buildData)) {

        let frontNodeModulesPath = path.join(project.path, "front", "node_modules");
        let backNodeModulesPath = path.join(project.path, "back", "node_modules");

        if (!fs.existsSync(frontNodeModulesPath))
            frontNodeModulesPath = null;
        
        if (!fs.existsSync(backNodeModulesPath))
            backNodeModulesPath = null;

        buildData[name] = {
            frontNodeModulesPath,
            backNodeModulesPath,
            data: {
                functions: { },
                name,
                author: project.author,
                description: project.description
            }
        };
    }
    let outKey = Object.entries(graph.nodes).find(([k, v]) => v.type === "out")[0];
    buildFunction(loaded, buildData, graph, outKey, buildData[name].data.functions);

    // Return the location of the built root function of the graph
    return { projectName: name, functionName: graph.meta.name };
}

function buildFunction(loaded, buildData, graph, key, functions) {
    let node = graph.nodes[key];
    let name = node.name;

    let fDef = {
        name: graph.meta.name + "." + name,
        type: node.type,
        sides: ['F', 'B'],
        inputs: {},
        nodeId: key
    };

    switch(node.type) {
        case "out":
            fDef.name = graph.meta.name;
            fDef.author = graph.meta.author;
            fDef.description = graph.meta.description;
            fDef.inputs = resolveInputs(graph, node.inputs);

            propagate(loaded, buildData, graph, node.inputs, functions);
            break;

        case "in":
            fDef.label = name;
            break;

        case "edit":
            break;
            
        case "back":
        case "front":
        case "agno":
            let sides = {front: ['F'], back: ['B'], agno: ['F', 'B']}[node.type];
            
            fDef.type = "code";
            fDef.sides = sides;
            fDef.inputs = resolveInputs(graph, node.inputs);
            fDef.content = node.content;
            
            propagate(loaded, buildData, graph, node.inputs, functions);
            break;

        case "data":
            fDef.value = node.content;
            break;
        
        case "graph":
            // Load the graph's data and compile it
            
            let rootLocation = buildGraph(loaded, buildData, node.location.projectId, node.location.graphId);

            let inputs = resolveInputs(graph, node.inputs);
            fDef.type = "call";
            fDef.inputs = inputs;
            fDef.parameters = node.parameters;
            fDef.location = {
                functionName: rootLocation.functionName,
                projectName: rootLocation.projectName
            };

            propagate(loaded, buildData, graph, node.inputs, functions);
            break;

        default:
            throw new Error(`Cannot compile nodes with the type '${node.type}'`);
    }
    
    if (fDef.name in functions) {
        if (fDef.nodeId !== functions[fDef.name].nodeId)
            throw new Error("Name collision for " + fDef.name);
    }
    else {
        functions[fDef.name] = fDef;
    }
}


function propagate(loaded, buildData, graph, inputs, functions) {
    // Compile all inputting nodes
    for (let input of inputs) {
        let key = graph.ports[graph.links[input]].node;
        buildFunction(loaded, buildData, graph, key, functions);
    }
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

    return graph.meta.name + "." + sourceName;
}

function resolveInputs(graph, inputs) {
    let result = {};

    for (let key of inputs) {
        let { label } = graph.ports[key];
        let sourceName = resolveInput(graph, key);
        result[label] = sourceName;
    }

    return result;
}

export default buildProject;