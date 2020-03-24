import { createStore } from 'redux';
import graphActions from './actions/graph';
import nodeActions from './actions/node';
import portActions from './actions/port';
import linkActions from './actions/link';
import selectionActions from './actions/selection';


const init = {
    graph: {
        state: "loaded",
        meta: {
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
    },
    modals: {
        newGraph: false
    }
}

function SET_MODAL_OPEN(state, action) {
    let newState = { ...state };

    newState[action.name] = action.open;

    return newState;
}

function lookupReducer(state, action, lookup) {
    if (action.type in lookup)
        return lookup[action.type](state, action);
    
    return state;
}

function rootReducer(state=init, action) {
    let newState = {
        ...state,
        graph: lookupReducer(state.graph, action, {...graphActions, ...nodeActions, ...portActions, ...linkActions, ...selectionActions}),
        modals: lookupReducer(state.modals, action, {SET_MODAL_OPEN})
    };

    console.log(action);
    console.log(newState);
    return newState;
}


const store = createStore(rootReducer);


export default store;
