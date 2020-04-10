import { uuid4 } from './node';
import linkActions from './link';

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
            newState = linkActions.DELETE_LINK(newState, {sink});
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
    newState.ports[key] = {x: 0, y: 0, node: action.node};

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

export default { DELETE_PORT, ADD_PORT, CHANGE_PORT };
