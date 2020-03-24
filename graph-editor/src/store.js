import { createStore } from 'redux';
import { readlink } from 'fs';

function uuid4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => {
    let a = crypto.getRandomValues(new Uint8Array(1))[0];
    return (c ^ a & 15 >> c / 4).toString(16);// eslint-disable-line no-mixed-operators
  });
}

const init = {
    state: "loading",
    graph: {
        name: "Default",
        author: "",
        category: "",
        description: "This is the default app for Obsidian, it is loaded on startup for testing purposes",
        hideInLibrary: false,
        tags: ""
    },
    nodes: {
        A: {
            type: "in",
            name: "Node A",
            x: 0,
            y: 0,
            preview: {
                state: "loaded",
                data: {a: 1, b: 2, c: 3}
            },
            inputs: [
                {key: "Ain", label: "input", type: "py"}
            ],
            output: {key: "Aout", label: "out", type: "py"}
        },
        B: {
            type: "out",
            name: "Node B",
            x: 300,
            y: 0,
            preview: {
                state: "error",
                data: null
            },
            inputs: [
                {key: "Bin", label: "input", type: "py"}
            ],
            output: null
        },
        C: {
            type: "py",
            name: "Node C",
            x: 300,
            y: 300,
            module: "main.node_c",
            preview: {
                state: "error",
                data: null
            },
            inputs: [
                {key: "Cin", label: "input", type: "py"}
            ],
            output: {key: "Cout", label: "out", type: "py"}
        }
    },
    ports: {
        Aout: {x: 50, y: 50},
        Bin: {x: 350, y: 100},
        Cin: {x: 350, y: 400}
    },
    links: {
        Bin: "Aout"
    },
    newLink: {
        port: null,
        inout: null
    },
    selection: []
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

function MOVE_PORT(state, action) {
    let newState = {...state};
    newState[action.port] = {
        ...state[action.port],
        x: action.x,
        y: action.y
    };
    return newState;
}

function SET_SELECTION(state, action) {
    let newState = {
        ...state,
    };

    newState.selection = action.items;

    return newState;
}

function START_LINK(state, action) {
    return {
        ...state,
        newLink: {
            ports: [action.port],
            inout: action.inout
        }
    }
}

function RELINK(state, action) {
    let newState = { 
        ...state,
        links: { ...state.links }
    };

    let ports = [];

    if (action.inout === "in") {
        ports.push(newState.links[action.port]);
        if (action.port in newState.links)
            newState = DELETE_LINK(newState, {sink: action.port});
    }
    else {
        let links = Object.entries(newState.links).filter(([sink, source]) => source === action.port);
        for (let [sink, source] of links) {
            ports.push(sink);
            newState = DELETE_LINK(newState, {sink});
        }
    }

    newState.newLink = {
        ports,
        inout: action.inout === "in" ? "out" : "in"
    }

    return newState;
}

function END_LINK(state, action) {
    if (!state.newLink)
        return state;

    let inout1 = state.newLink.inout;
    let inout2 = action.inout;

    if (inout1 === inout2)
        return state;

    let newState = {
        ...state,
        links: {...state.links},
        newLink: null
    }

    let sources = (inout1 === "in") ? [action.port] : state.newLink.ports;
    let sinks   = (inout1 === "in") ? state.newLink.ports : [action.port];
    console.log({sources, sinks})
    for (let sink of sinks)
        for (let source of sources)
            newState.links[sink] = source;

    return newState;
}

function CHANGE_SELECTION(state, action) {
    let newState = {
        ...state
    }

    let select = newState.selection[0];

    if (select.type === "node") {
        newState.nodes = {...newState.nodes};
        let oldNode = newState.nodes[select.key];
        newState.nodes[select.key] = action.change(oldNode);
    }
    else if (select.type === "graph") {
        newState.graph = {...newState.graph};
        let oldGraph = newState.graph;
        newState.graph = action.change(oldGraph);
    }

    return newState;
}

function DELETE_LINK(state, action) {
    let newState = {
        ...state,
        links: { ...state.links }
    };

    delete newState.links[action.sink];

    return newState;
}

function DELETE_PORT(state, action) {
    let key = action.key;
    console.log(key);

    let newState = {
        ...state,
        ports: {
            ...state.ports
        },
        links: {
            ...state.links
        }
    };

    for (let [sink, source] of Object.entries(newState.links)) {
        if (source === key || sink === key)
            newState = DELETE_LINK(newState, {sink});
    }

    delete newState.ports[key];

    return newState;
}

function ADD_PORT(state, action) {
    let newState = {
        ...state,
        nodes: { ...state.nodes },
        ports: { ...state.ports }
    };

    let key = uuid4();
    newState.nodes[action.node].inputs.push({key, label: "Port", type: "data"});
    newState.ports[key] = {x: 0, y: 0};

    return newState;
}

function DELETE_SELECTION(state, action) {
    let newState = {...state};

    for (let item of state.selection) {
        if (item.type === "node") {
            let target = state.nodes[item.key];
            
            if (target.output)
                newState = DELETE_PORT(newState, {key: target.output.key});
            for (let input of target.inputs)
                newState = DELETE_PORT(newState, {key: input.key});
    
            newState.nodes = {...newState.nodes};
            delete newState.nodes[item.key];
        }
        if (item.type === "link") {
            newState.links = {...newState.links};
            newState = DELETE_LINK(newState, {sink: item.key});
        }
    }

    newState.selection = [];

    return newState;
}

function LOAD_GRAPH(state, action) {
    let newState = {
        ...state,
        ...action.data
    };

    return newState;
}

function lookupReducer(state, action, lookup) {
    if (action.type in lookup)
        return lookup[action.type](state, action);
    
    return state;
}

function stateReducer(state, action) {
    let newState = lookupReducer(state, action, {RELINK, START_LINK, END_LINK, CHANGE_SELECTION, MOVE_NODE, DELETE_SELECTION, SET_SELECTION, LOAD_GRAPH, ADD_PORT, NEW_NODE});
    return {
        ...newState,
        nodes: lookupReducer(newState.nodes, action, {}),
        ports: lookupReducer(newState.ports, action, {MOVE_PORT}),
    };
}

function rootReducer(state=init, action) {
    let newState = stateReducer(state, action);
    console.log(action);
    console.log(newState);
    return newState;
}


const store = createStore(rootReducer);


export default store;
