const { getDefaultParams } = require("../UI/Schema");


function uuid4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => {
        let a = crypto.getRandomValues(new Uint8Array(1))[0];
        return (c ^ a & 15 >> c / 4).toString(16);// eslint-disable-line no-mixed-operators
    });
}

function MOVE_NODE(state, action) {
    let newState = {...state, nodes: {...state.nodes}, ports: {...state.ports}};
    newState.nodes[action.node] = {
        ...state.nodes[action.node],
        x: action.x,
        y: action.y
    }

    for (let port of action.ports) {
        newState.ports[port.port] = {
            ...state.ports[port.port],
            x: port.x,
            y: port.y
        };
    }
    return newState;
}


function transformImportedGraph(graph, path) {    
    let data = {
        path,
        parameters: null,
        inputs:[], 
        output: null, 
        schema: null,
        name: graph.meta.name,
        meta: graph.meta
    };

    for (let node of Object.values(graph.nodes)) {
        if (node.type === "in") {
            data.inputs.push({ label: node.name, type: node.output.type });
        }

        if (node.type === "out") {
            data.output = { label: node.name, type: node.inputs[0].type };
        }

        if (node.type === "edit") {
            data.schema = JSON.parse(node.schema);
            data.parameters = getDefaultParams(data.schema);
        }
    }
    
    return data;
}


function NEW_NODE(state, action) {
    let type = action.nodeType;

    let data = {
        py: () => ({name: "Python", inputs: [{label: "input", type: "py"}]}),
        js: () => ({name: "JavaScript", inputs: [{label: "input", type: "js"}]}),
        data: () => ({name: "Data", content: ""}),
        in: () => ({name: "Input", output: {label: "value", type: "data"}}),
        out: () => ({name: "Output", inputs: [{label: "value", type: "data"}], output: null}),
        edit: () => ({name: "Editor", output: {label: "value", type: "data"}, schema: ""}),
        graph: () => transformImportedGraph(action.data, action.path)
    }[type]();

    let newState = {
        ...state, 
        nodes:{ ...state.nodes } 
    };

    let newNode = {
        type,
        name: "New Node",
        x: 0,
        y: 0,
        inputs: [],
        output: {label: "value", type: type},
        ...data
    }

    let nodeKey = uuid4();

    for (let input of newNode.inputs) {
        input.key = uuid4();
        newState.ports[input.key] = {x: 0, y: 0, node: nodeKey};
    }

    if (newNode.output) {
        newNode.output.key = uuid4();
        newState.ports[newNode.output.key] = {x: 0, y: 0, node: nodeKey};
    }

    newState.nodes[nodeKey] = newNode;
    return newState;
};


export default { MOVE_NODE, NEW_NODE };
export { uuid4 };