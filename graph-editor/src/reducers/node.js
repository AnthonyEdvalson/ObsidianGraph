import { lookupReducerFactory } from "./util";
import { util } from 'obsidian';
import nodes from '../logic/nodes';
import { ADD_PORT, DELETE_PORT } from "./port";

function NEW_NODE(state, action, fullState) {
    let type = action.nodeType;
    let data = {
        back: () => ({node: {name: "Backend", content: "function main({input}) {\n\t\n}\n\nexport default { main };\n"}, inputs: [{label: "input"}]}),
        front: () => ({node: {name: "Frontend", content: "import React from 'react';\n\nfunction Main({input}) {\n\t\n}\n\nexport default { main: Main };\n"}, inputs: [{label: "input"}]}),
        agno: () => ({node: {name: "Code", content: "function main({input}) {\n\t\n}\n\nexport default { main };\n"}, inputs: [{label: "input"}]}),
        data: () => ({node: {name: "Data", content: ""}}),
        in: () => ({node: {name: "Input", valueType: "value"}, inputs: [{label: "Default"}], output: {label: "value"}}),
        out: () => ({node: {name: "Output"}, inputs: [{label: "value"}], output: null}),
        edit: () => ({node: {name: "Editor", schema: ""}, output: {label: "value"}}),
        graph: () => action.data
    }[type]();

    data = {
        inputs: [],
        output: {label: "out"},
        ...data,
    }

    let newState = {
        ...state, 
        nodes:{ ...state.nodes } 
    };

    let newNode = {
        type,
        name: "New Node",
        x: action.x,
        y: action.y,
        output: null,
        inputs: [],
        ...data.node
    }

    let nodeKey = util.uuid4();
    console.log(data);
    newNode.name = cleanName(state.nodes, newNode.name, nodeKey);
    newState.nodes[nodeKey] = newNode;

    for (let input of data.inputs)
        newState = ADD_PORT(newState, { node: nodeKey, ...input, inout: "in" });

    if (data.output)
        newState = ADD_PORT(newState, { node: nodeKey, ...data.output, inout: "out" });

    return nodes.refreshInterface(nodeKey, newState, fullState);
};

function hasNameConflict(nodes, name, nodeKey) {
    return Object.entries(nodes).some(([key, node]) => node.name === name && key !== nodeKey);
}

function cleanName(nodes, name, node) {
    name = name.replace(/\./g, "_");
    name = name.replace(/^_/g, "");

    const numRegex = / *[0-9]+$/;
    let num = parseInt(name.match(numRegex)) || 1;
    let baseName = name.replace(numRegex, "");

    while (hasNameConflict(nodes, name, node)) {
        num++;
        name = baseName + " " + num.toString();
    }

    return name;
}

function SET_NODE_NAME(state, {node, name}) {
    let newState = {
        ...state, 
        nodes: { ...state.nodes } 
    };

    newState.nodes[node] = {
        ...state.nodes[node],
        name: cleanName(state.nodes, name, node)
    };

    return newState;
}

function SET_CONTENT(state, action) {
    let newState = {
        ...state,
        nodes: { ...state.nodes} // TODO In graph reducers, replace state with state.nodes, and provide the full graph state as a third param
    };

    let node = util.access(newState, "nodes", action.nodeId);
    node.content = action.content;

    return newState;
}

function DELETE_NODE(state, action) {
    let newState = {
        ...state,
        nodes: {
            ...state.nodes
        }
    };

    let target = state.nodes[action.nodeId];
            
    if (target.output)
        newState = DELETE_PORT(newState, { key: target.output });
        
    for (let key of target.inputs)
        newState = DELETE_PORT(newState, { key });

    delete newState.nodes[action.nodeId];

    return newState;
}

export default lookupReducerFactory({ NEW_NODE, SET_NODE_NAME, SET_CONTENT, });
export { hasNameConflict, cleanName, DELETE_NODE }; // TODO move to logic
