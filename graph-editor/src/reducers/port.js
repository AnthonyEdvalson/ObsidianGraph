import { util } from 'obsidian';
import { DELETE_LINK } from './link';
import { lookupReducerFactory } from './util';

function DELETE_PORT(state, action) {
    let key = action.key;
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
    let key = util.uuid4();
    let node = state.nodes[action.node];

    let newState = {
        ...state,
        nodes: { 
            ...state.nodes,
            [action.node]: {
                ...node,
                inputs: [...node.inputs, key],
                samples: node.samples.map(s => ({ ...s, inputs: { ...s.inputs, [key]: null }}))
            }
        },
        ports: { 
            ...state.ports,
            [key]: {label: "label", node: action.node, type: "data"}
        }
    };

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
export { DELETE_PORT }