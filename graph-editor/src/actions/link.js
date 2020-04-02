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
        for (let kv of links) {
            let sink = kv[0];
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
    for (let sink of sinks)
        for (let source of sources)
            newState.links[sink] = source;

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

export default { START_LINK, RELINK, END_LINK, DELETE_LINK };