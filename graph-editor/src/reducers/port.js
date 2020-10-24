import { util } from 'obsidian';
import { DELETE_LINK } from './link';
import { lookupReducerFactory } from './util';

function DELETE_PORT(state, action) {
    let key = action.key;
    let parentNode = state.ports[key].node;

    let isOutput = state.nodes[parentNode].output === key;

    let newState = {
        ...state,
        nodes: {
            ...state.nodes,
            [parentNode]: {
                ...state.nodes[parentNode]
            }
        },
        ports: {
            ...state.ports
        },
        links: {
            ...state.links
        }
    };

    if (isOutput)
        newState.nodes[parentNode].output = null;
    else {
        let node = newState.nodes[parentNode];
        node.inputs = node.inputs.filter(i => i !== key);
    }

    for (let [sink, source] of Object.entries(state.links)) {
        if (source === key || sink === key) {
            newState = DELETE_LINK(newState, {sink});
        }
    }

    delete newState.ports[key];

    return newState;
}

function ADD_PORT(state, action) {
    let key = util.uuid4();
    let node = state.nodes[action.node];


    let newState = {
        ...state,
        nodes: { 
            ...state.nodes,
            [action.node]: {
                ...node
            }
        },
        ports: { 
            ...state.ports,
            [key]: { label: action.label || "label", node: action.node , interId: action.interId }
        }
    };

    if (action.output)
        newState.nodes[action.node].output = key;
    else
        newState.nodes[action.node].inputs = [...node.inputs, key];


    return newState;
}

function CHANGE_PORT(state, action) {
    let newState = {
        ...state,
        ports: { ...state.ports }
    };

    newState.ports[action.port] = action.change(newState.ports[action.port]);
    return newState;
}

export default lookupReducerFactory({ DELETE_PORT, ADD_PORT, CHANGE_PORT });
export { DELETE_PORT, ADD_PORT, CHANGE_PORT }