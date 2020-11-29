import { lookupReducerFactory } from "./util";
import { util } from "obsidian";
import { ADD_PIN, DELETE_PIN } from "./port";

function START_LINK(state, action) {
    return {
        ...state,
        newLink: {
            pins: [action.pin],
            inout: action.inout,
            transaction: action.transaction,
            makeStart: action.makeStart || false,
            port: action.port || null
        }
    }
}

function START_LINK_LIST(state, action) {
    action.pin = util.uuid4();
    action.makeStart = true;
    return START_LINK(state, action)
}

function RELINK(state, action) {
    let newState = { 
        ...state,
        links: { ...state.links }
    };

    let pins = [];

    if (action.inout === "in") {
        pins.push(newState.links[action.pin]);
        if (action.pin in newState.links)
            newState = DELETE_LINK(newState, {sink: action.pin});
    }
    else {
        let links = Object.entries(newState.links).filter(([sink, source]) => source === action.pin);
        for (let kv of links) {
            let sink = kv[0];
            pins.push(sink);
            newState = DELETE_LINK(newState, {sink});
        }
    }

    newState.newLink = {
        pins,
        inout: action.inout === "in" ? "out" : "in",
        transaction: action.transaction,
        makeStart: false
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

    if (state.newLink.makeStart) {
        newState = ADD_PIN(newState, { portId: state.newLink.port, pinId: state.newLink.pins[0] });
    }

    let sources = (inout1 === "in") ? [action.pin] : state.newLink.pins;
    let sinks   = (inout1 === "in") ? state.newLink.pins : [action.pin];

    for (let sink of sinks)
        for (let source of sources)
            newState.links[sink] = source;

    return newState;
}

function END_LINK_LIST(state, action) {
    if (!state.newLink)
        return state;

    let inout1 = state.newLink.inout;
    let inout2 = action.inout;

    if (inout1 === inout2)
        return state;
    
    let pinId = util.uuid4();
    let newState = ADD_PIN(state, { pinId, portId: action.port });
    action.pin = pinId;

    return END_LINK(newState, action);
}


function DELETE_LINK(state, action) {
    let newState = {
        ...state,
        links: { ...state.links }
    };

    let portId = state.pins[action.sink].port;
    let port = state.ports[portId];

    delete newState.links[action.sink];

    if (port.valueType === "list")
        newState = DELETE_PIN(newState, { pinId: action.sink });

    return newState;
}

export default lookupReducerFactory({ START_LINK, RELINK, END_LINK, DELETE_LINK, START_LINK_LIST, END_LINK_LIST });
export { DELETE_LINK };
