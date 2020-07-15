import { lookupReducerFactory } from "./util";
import { access } from "../util";


function uuid4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => {
        let a = crypto.getRandomValues(new Uint8Array(1))[0];
        return (c ^ a & 15 >> c / 4).toString(16);// eslint-disable-line no-mixed-operators
    });
}

function NEW_NODE(state, action) {
    let type = action.nodeType;
    let data = {
        back: () => ({node: {name: "Backend", content: "function main(o) {\n\t\n}\n\nmodule.exports = { main };\n"}, inputs: [{label: "input", type: "back"}]}),
        front: () => ({node: {name: "Frontend", content: "import React from 'react';\n\nfunction Main(o) {\n\t\n}\n\nmodule.exports = { main: Main };\n"}, inputs: [{label: "input", type: "front"}]}),
        data: () => ({node: {name: "Data", content: ""}}),
        in: () => ({node: {name: "Input"}, output: {label: "value", type: "data"}}),
        out: () => ({node: {name: "Output"}, inputs: [{label: "value", type: "data"}], output: null}),
        edit: () => ({node: {name: "Editor", schema: ""}, output: {label: "value", type: "data"}}),
        graph: () => action.data
    }[type]();

    data = {
        inputs: [],
        output: {label: "out", type: "data"},
        ...data,
    }

    let newState = {
        ...state, 
        nodes:{ ...state.nodes } 
    };

    let newNode = {
        type,
        name: "New Node",
        x: 0,
        y: 0,
        output: null,
        inputs: [],
        ...data.node
    }

    let nodeKey = uuid4();
    
    for (let input of data.inputs) {
        let key = uuid4();
        newNode.inputs.push(key);
        newState.ports[key] = { node: nodeKey, ...input };
    }

    if (data.output) {
        let key = uuid4();
        newNode.output = key;
        newState.ports[key] = { node: nodeKey, ...data.output};
    }

    newState.nodes[nodeKey] = newNode;
    return newState;
};

function hasNameConflict(nodes, name, nodeKey) {
    return Object.entries(nodes).some(([key, node]) => node.name === name && key !== nodeKey);
}

function cleanName(nodes, name, node) {
    name = name.replace(/\./g, "_");
    name = name.replace(/^_/g, "");

    const numRegex = /[0-9]+$/;
    let num = parseInt(name.match(numRegex)) || 0;
    let baseName = name.replace(numRegex, "");
    while (hasNameConflict(nodes, name, node)) {
        num++;
        name = baseName + num.toString();
    }

    return name;
}

function SET_NODE_NAME(state, {node, name}) {
    let newState = {
        ...state, 
        nodes:{ ...state.nodes } 
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
        nodes: { ...state.nodes} // In graoh reducers, replace state with state.nodes, and provide the full graph state as a third param
    };

    let node = access(newState, "nodes", action.nodeId);
    node.content = action.content;

    return newState;
}


export default lookupReducerFactory({ NEW_NODE, SET_NODE_NAME, SET_CONTENT });
export { uuid4, hasNameConflict, cleanName }; // TODO move to logic