const { getDefaultParams } = require("../UI/Schema");


function uuid4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => {
        let a = crypto.getRandomValues(new Uint8Array(1))[0];
        return (c ^ a & 15 >> c / 4).toString(16);// eslint-disable-line no-mixed-operators
    });
}


function transformImportedGraph(graph, path) {    
    let data = {
        node: {
            path,
            parameters: null,
            schema: null,
            name: graph.meta.name,
            meta: graph.meta
        },
        inputs: [],
        output: null
    };

    for (let node of Object.values(graph.nodes)) {
        if (node.type === "in")
            data.inputs.push({ label: node.name, type: node.output.type });

        if (node.type === "out")
            data.output = { label: node.name, type: node.inputs[0].type };

        if (node.type === "edit") {
            data.node.schema = JSON.parse(node.schema);
            data.node.parameters = getDefaultParams(data.schema);
        }
    }
    
    return data;
}


function NEW_NODE(state, action) {
    let type = action.nodeType;

    let data = {
        py: () => ({node: {name: "Python"}, inputs: [{label: "input", type: "py"}]}),
        js: () => ({node: {name: "JavaScript"}, inputs: [{label: "input", type: "js"}]}),
        data: () => ({node: {name: "Data", content: ""}}),
        in: () => ({node: {name: "Input"}, output: {label: "value", type: "data"}}),
        out: () => ({node: {name: "Output"}, inputs: [{label: "value", type: "data"}], output: null}),
        edit: () => ({node: {name: "Editor", schema: ""}, output: {label: "value", type: "data"}}),
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


export default { NEW_NODE };
export { uuid4 };
