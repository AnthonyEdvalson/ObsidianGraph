import { ZipBetter } from "./ZipBetter";

const fs = window.require("fs");
const path = window.require("path");

function buildProject(loaded, projectId) {
    let buildData = { };
    let project = loaded[projectId];

    let startup = project.startup || Object.entries(project.graphs).find(g => g[1].present.meta.name.toLowerCase() === "main")[0];

    if (!startup)
        throw new Error("Cannot build " + project.name + ". It has no startup graph");

    let root = buildGraph(loaded, buildData, projectId, startup);
    
    let zip = new ZipBetter();

    for (let [name, project] of Object.entries(buildData)) {
        let projectFolder = zip.addFolder(name);

        if (project.frontNodeModulesPath)
            projectFolder.importFolder(project.frontNodeModulesPath, "front_node_modules");
        
        if (project.backNodeModulesPath)
            projectFolder.importFolder(project.backNodeModulesPath, "back_node_modules");

        projectFolder.addFile("project.json", JSON.stringify(project.data, null, 2));
        projectFolder.addFile("project.css", project.css);
    }

    let appData = {
        root,
        projects: Object.keys(buildData),
        name: project.name,
        author: project.author,
        description: project.description
    };

    zip.addFile("app.json", JSON.stringify(appData, null, 2));
    console.log(appData, buildData)

    return [zip, project.name, buildData];
}

function buildGraph(loaded, buildData, projectId, graphId) {
    let project = loaded[projectId];
    let graph = project.graphs[graphId].present;
    let name = project.name

    if (!(name in buildData)) {
        // Move to buildProject
        let frontNodeModulesPath = path.join(project.path, "front", "node_modules");
        let backNodeModulesPath = path.join(project.path, "back", "node_modules");

        if (!fs.existsSync(frontNodeModulesPath))
            frontNodeModulesPath = null;
        
        if (!fs.existsSync(backNodeModulesPath))
            backNodeModulesPath = null;

        buildData[name] = {
            frontNodeModulesPath,
            backNodeModulesPath,
            css: "/* Project: " + name + " */",
            data: {
                functions: { },
                name,
                author: project.author,
                description: project.description,
            }
        };
    }
    let outKey = Object.entries(graph.nodes).find(([k, v]) => v.type === "out")[0];

    buildData[name].css += "\n\n/* Graph: " + graph.meta.name + " */\n\n" + graph.css
    buildFunction(loaded, buildData, graph, outKey, buildData[name].data.functions);

    // Return the id of the root function of the graph
    return outKey;
}

function buildFunction(loaded, buildData, graph, key, functions) {
    console.log(graph, key)
    let node = graph.nodes[key];
    let name = node.name;

    let fDef = {
        name: graph.meta.name + "." + name,
        type: node.type,
        sides: ['F', 'B'],
        inputs: {},
        functionId: key
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
            fDef.inputs = resolveInputs(graph, node.inputs);
            propagate(loaded, buildData, graph, node.inputs, functions);
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
            let root = buildGraph(loaded, buildData, node.location.projectId, node.location.graphId);

            fDef.type = "call";
            fDef.inputs = resolveInputs(graph, node.inputs);
            fDef.parameters = node.parameters;
            fDef.root = root;

            propagate(loaded, buildData, graph, node.inputs, functions);
            break;

        default:
            throw new Error(`Cannot compile nodes with the type '${node.type}'`);
    }
    
    functions[key] = fDef;
}


function propagate(loaded, buildData, graph, inputs, functions) {
    // Compile all inputting nodes
    for (let input of inputs) {
        let source = resolveInput(graph, input);

        if (Array.isArray(source))
            source.forEach(s => buildFunction(loaded, buildData, graph, s, functions));
        else if (source)
            buildFunction(loaded, buildData, graph, source, functions);
    }
}

function resolvePinInput(graph, pinId) {
    if (!(pinId in graph.links)) 
        return null;

    let sourcePinId = graph.links[pinId];
    let sourceNodeId = graph.pins[sourcePinId].node;
    return sourceNodeId;// graph.nodes[sourceNodeId].name;
}

function resolveInput(graph, portId) {
    /*let { links, ports, nodes } = graph;
    let sourceName = null;

    if (port in links) {
        let sourcePortKey = links[port];
        let sourceNodeKey = ports[sourcePortKey].node;
        let sourceNode = nodes[sourceNodeKey];
        sourceName = sourceNode.name;
    }*/
    
    let port = graph.ports[portId];

    let source;

    if (port.pin)
        source = resolvePinInput(graph, port.pin);
    else if (port.pins)
        source = port.pins.map(pinId => resolvePinInput(graph, pinId)).filter(x => x);

    return source;
}

function resolveInputs(graph, inputs) {
    let result = {};

    for (let portId of inputs) {
        let { label } = graph.ports[portId];
        let source = resolveInput(graph, portId);
        result[label] = source;
    }

    return result;
}

export default buildProject;