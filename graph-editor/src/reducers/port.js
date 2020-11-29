import { util } from 'obsidian';
import { DELETE_LINK } from './link';
import { lookupReducerFactory } from './util';

function DELETE_PORT(state, action) {
    let key = action.key;
    let port = state.ports[key];
    let parentNode = port.node;

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
        }
    };

    if (isOutput)
        newState.nodes[parentNode].output = null;
    else {
        let node = newState.nodes[parentNode];
        newState.nodes[parentNode].inputs = node.inputs.filter(i => i !== key);
    }

    if (port.valueType === "value") {
        newState = DELETE_PIN(newState, { pinId: port.pin });
    }
    else if (port.valueType === "list") {
        for (let pinId of port.pins)
            newState = DELETE_PIN(newState, { pinId });
    }
    else {
        throw new Error("Deleting a port of type " + port.valueType + " is not implemented");
    }

    delete newState.ports[key];

    return newState;
}

function ADD_PORT(state, action) {
    let portId = util.uuid4();
    let node = state.nodes[action.node];

    let port = {
        label: action.label || "label", 
        node: action.node, 
        interId: action.interId,
        valueType: action.valueType || "value"
    }

    let pinIds;
    if (port.valueType === "value") {
        // Add a new pin from the action, if an id is not given then one is generated randomly
        let pinId = action.pin || util.uuid4();
        port.pin = pinId;
        pinIds = [pinId];
    }
    else if (port.valueType === "list") {
        // Adds the pins from the action, if ids are not given, then it is the empty list
        pinIds = action.pins || [];
        port.pins = pinIds;
    }
    else {
        throw new Error("Creating a port of type " + port.valueType + " is not implemented");
    }

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
            [portId]: port
        },
        pins: {
            ...state.pins
        }
    };
    console.log(action, newState.nodes, portId)
    if (action.inout === "out")
        newState.nodes[action.node].output = portId;
    else
        newState.nodes[action.node].inputs = [...node.inputs, portId];


    for (let pinId of pinIds) {
        newState.pins[pinId] = {
            node: port.node,
            port: portId 
        }
    }

    return newState;
}

function ADD_PIN(state, action) {
    let port = state.ports[action.portId];

    let newState = {
        ...state,
        ports: {
            ...state.ports,
            [action.portId]: {
                ...state.ports[action.portId]
            }
        },
        pins: {
            ...state.pins,
            [action.pinId]: {
                port: action.portId,
                node: state.ports[action.portId].node
            }
        }
    }

    if (port.valueType === "list") {
        newState.ports[action.portId].pins = [
            ...newState.ports[action.portId].pins,
            action.pinId
        ]
    }
    else {
        newState.ports[action.portId].pin = action.pinId
    }

    return newState;
}

function DELETE_PIN(state, action) {
    let pinId = action.pinId;
    let pin = state.pins[pinId];
    let port = state.ports[pin.port];

    let newState = {
        ...state,
        pins: {
            ...state.pins
        }
    };

    if (port.valueType === "list") {
        let newPort = { 
            ...newState.ports[pin.port],
            pins: newState.ports[pin.port].pins.filter(p => p !== pinId)
        };

        newState.ports = { 
            ...newState.ports, 
            [pin.port]: newPort
        };
    }

    for (let [sink, source] of Object.entries(state.links)) {
        if (source === pinId || sink === pinId)
            newState = DELETE_LINK(newState, {sink});
    }

    delete newState.pins[pinId];

    return newState;
}

function CHANGE_PORT(state, action) {
    let newState = {
        ...state,
        ports: { ...state.ports }
    };

    let port = action.change(newState.ports[action.port]);
    newState.ports[action.port] = port;

    if (port.valueType === "list") {
        if ("pin" in port) {
            port.pins = [port.pin];
            delete port.pin;
        }
        
        if (!("pins" in port))
            port.pins = [];
    }
    else {
        if ("pins" in port) {
            if (port.pins.length > 0)
                port.pin = port.pins[0];
            delete port.pins;
        }

        if (!("pin" in port))
            newState = ADD_PIN(newState, { pinId: util.uuid4(), portId: action.port});
    }
    
    return newState;
}

export default lookupReducerFactory({ DELETE_PORT, ADD_PORT, CHANGE_PORT, ADD_PIN });
export { DELETE_PORT, ADD_PORT, CHANGE_PORT, ADD_PIN, DELETE_PIN }