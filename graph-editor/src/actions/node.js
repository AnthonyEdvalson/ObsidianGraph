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

function NEW_NODE(state, action) {
    let type = action.nodeType;

    let data = {
        py: {name: "Python", inputs: [{label: "input", type: "py"}], module: ""},
        js: {name: "JavaScript", inputs: [{label: "input", type: "js"}], path: ""},
        data: {name: "Data", content: ""},
        in: {name: "Input", output: {label: "value", type: "data"}},
        out: {name: "Output", inputs: [{label: "value", type: "data"}], output: null},
        edit: {name: "Editor", output: {label: "data", type: "data"}, schema: ""},
        graph: action.data
    }[type];

    let newState = {
        ...state, 
        nodes:{ ...state.nodes } 
    };

    let newNode = {
        type,
        name: "New Node",
        x: 0,
        y: 0,
        preview: {
            state: "loading",
            data: null
        },
        inputs: [],
        output: {label: "out", type: type},
        ...data
    }

    for (let input of newNode.inputs) {
        input.key = uuid4();
        newState.ports[input.key] = {x: 0, y: 0};
    }

    if (newNode.output) {
        newNode.output.key = uuid4();
        newState.ports[newNode.output.key] = {x: 0, y: 0};
    }

    newState.nodes[uuid4()] = newNode;
    return newState;
};


export default { MOVE_NODE, NEW_NODE };
export { uuid4 };