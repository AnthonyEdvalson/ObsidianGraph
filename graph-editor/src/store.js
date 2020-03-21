import { createStore } from 'redux';

function uuid4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => {
    let a = crypto.getRandomValues(new Uint8Array(1))[0];
    return (c ^ a & 15 >> c / 4).toString(16);// eslint-disable-line no-mixed-operators
  });
}

const init = {
    state: "loading",
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
    selection: null
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
        py: {name: "Python", inputs: [{key: uuid4(), label: "input", type: "py"}], module: ""},
        js: {name: "JavaScript", inputs: [{key: uuid4(), label: "input", type: "js"}], path: ""},
        data: {name: "Data", content: ""},
        in: {name: "Input", output: {key: uuid4(), label: "value", type: "data"}},
        out: {name: "Output", inputs: [{key: uuid4(), label: "value", type: "data"}], output: null},
        edit: {name: "Editor", output: {key: uuid4(), label: "data", type: "data"}, schema: ""}
    }[type];

    let newState = {...state};
    newState[uuid4()] = {
        type,
        name: "New Node",
        x: 0,
        y: 0,
        preview: {
            state: "loading",
            data: null
        },
        inputs: [],
        output: {key: uuid4(), label: "out", type: type},
        ...data
    }
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

function SET_SELECT(state, action) {
    let newState = {
        ...state,
        selection: action.node
    };

    return newState;
}

function START_NEW_LINK(state, action) {
    return {
        ...state,
        newLink: {
            port: action.port,
            inout: action.inout
        }
    }
}

function END_NEW_LINK(state, action) {
    if (!state.newLink)
        return state;

    let inout1 = state.newLink.inout;
    let inout2 = action.inout;

    if (inout1 === inout2)
        return state;

    let source = inout1 === "in" ? action.port : state.newLink.port;
    let sink = inout1 === "in" ? state.newLink.port : action.port;
    
    let newState = {
        ...state,
        links: {...state.links},
        newLink: null
    }

    if (newState.links[sink] === source)
        delete newState.links[sink];
    else
        newState.links[sink] = source;

    return newState;
}

function CHANGE_SELECTION(state, action) {
    let newState = {
        ...state,
        nodes: { ...state.nodes }
    }

    let select = newState.selection;

    let oldNode = newState.nodes[select];
    newState.nodes[select] = action.change(oldNode);

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
            delete newState.links[sink];
    }

    delete newState.ports[key];

    return newState;
}

function DELETE_SELECTION(state, action) {
    let target = state.nodes[state.selection];

    let newState = state;
    if (target.output)
        newState = DELETE_PORT(newState, {key: target.output.key});
    for (let input of target.inputs) {
        newState = DELETE_PORT(newState, {key: input.key});
    }

    newState = {
        ...newState,
        nodes: {...newState.nodes}
    };

    delete newState.nodes[newState.selection];
    newState.selection = null;

    return newState;
}

function lookupReducer(state, action, lookup) {
    if (action.type in lookup)
        return lookup[action.type](state, action);
    
    return state;
}

function stateReducer(state, action) {
    let newState = lookupReducer(state, action, {START_NEW_LINK, END_NEW_LINK, CHANGE_SELECTION, MOVE_NODE, DELETE_SELECTION, SET_SELECT});
    return {
        ...newState,
        nodes: lookupReducer(newState.nodes, action, {NEW_NODE}),
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

// DATA STRUCTURE
/*

{
    graph: {
        state: success,
        data: {
            nodes: {
                node_key: {
                    type: js
                    name: node_name
                    x: 0,
                    y: 0,
                    preview: {
                        state: success,
                        data: ...
                    } ,
                    inputs: [
                        {key: port_key}
                    ]
                },
                ...
            },
            ports: {
                port_key: {x: 0, y: 0},
                ...
            },
            links: {
                sink_port_key: source_node_key,
                ...
            ],
            newLink: { // null if not linking
                port: port_key,
                inout: "in" or "out"
            }
        }
    },
    selection: {
        node: node_key // can be other things in the future
    }
}

*/

export default store;
