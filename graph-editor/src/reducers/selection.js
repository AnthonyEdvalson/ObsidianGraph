import { DELETE_LINK } from './link';
import { DELETE_NODE } from './node';
import { CHANGE_PORT } from './port';
import { lookupReducerFactory } from './util';


function SET_SELECTION(state, action) {
    
    let newState = {
        ...state,
        selection: { ...state.selection }
    };

    if (action.ctrl) {
        for (let item of action.items) {
            let found = false;
            for (let s of state.selection.items) {
                if (s.type === item.type && s.key === item.key) {
                    found = true;
                    break;
                }
            }

            if (!found)
                newState.selection.items.push(item);
        }
    }
    else
        newState.selection.items = action.items;

    return newState;
}


function CHANGE_SELECTION(state, action) {
    
    let newState = {
        ...state,
        selection: { ...state.selection }
    };

    let select = newState.selection.items[0];

    if (select.type === "node") {
        newState.nodes = { ...newState.nodes };
        let oldNode = newState.nodes[select.key];
        let newNode = action.change(oldNode);

        newState.nodes[select.key] = newNode;

        if (newNode.type === "in") {
            let dPortId = newNode.inputs[0];
            let dPort = state.ports[dPortId];
            console.log(dPort, newNode)
            if (dPort.valueType !== newNode.valueType)
                newState = CHANGE_PORT(newState, { port: dPortId, change: p => ({ ...p, valueType: newNode.valueType }) });
        }

    }
    else if (select.type === "graph") {
        newState.meta = { ...newState.meta };
        let oldMeta = newState.meta;
        newState.meta = action.change(oldMeta);
    }

    return newState;
}

function DELETE_SELECTION(state, action) {
    
    let newState = {
        ...state,
        selection: { ...state.selection }
    };

    for (let item of state.selection.items) {
        if (item.type === "node") {
            newState = DELETE_NODE(newState, { nodeId: item.key });
        }
        if (item.type === "link") {
            newState.links = { ...newState.links };
            newState = DELETE_LINK(newState, { sink: item.key });
        }
    }

    newState.selection.items = [];

    return newState;
}

function REGISTER_SELECTABLE(state, action) {
    
    let newState = {
        ...state,
        selection: { ...state.selection }
    };

    if (action.item.type !== "graph") {
        if (!newState.selection.items.some(item => item.type === action.item.type && item.key === action.key))
            newState.selection.all.push(action.item);
    }
        
    return newState;
}

function UNREGISTER_SELECTABLE(state, action) {
    
    let newState = {
        ...state,
        selection: { ...state.selection }
    };

    newState.selection.all = newState.selection.all.filter(item => !(item.type === action.item.type && item.key === action.item.key));
    return newState;
}

function SELECT_ALL(state, action) {
    
    let newState = {
        ...state,
        selection: { ...state.selection }
    };

    newState.selection.items = [...newState.selection.all];
    return newState;
}


function MOVE_SELECTION(state, action) {
    let gt = action.transform;

    let newState = {
        ...state, 
        nodes: {...state.nodes}
    };
    
    for (let item of state.selection.items) {
        if (item.type === "node") {
            let n = newState.nodes[item.key];
            newState.nodes[item.key] = {
                ...n,
                x: n.x + action.dx / gt.s,
                y: n.y + action.dy / gt.s
            };
        }
    }

    return newState;
}

function SELECT_RECT(state, action) {
    
    let r = action.region;
    let x = Math.min(r.x, r.x + r.width);
    let y = Math.min(r.y, r.y + r.height);
    let width = Math.abs(r.width);
    let height = Math.abs(r.height);
    let nw = 280;
    let nh = 175;
    let items = [];

    for (let item of state.selection.all) {
        if (item.type === "node") {
            let node = state.nodes[item.key];
            let nx = node.x;
            let ny = node.y;

            if (x < nx + nw && nx < x + width && y < ny + nh && ny < y + height) {
                items.push(item);
            }
        }
    }

    return SET_SELECTION(state, {items, ctrl: action.ctrl});
}

function SET_DRAGGING(state, action) {
    
    let newState = {
        ...state,
        selection: {
            ...state.selection,
            dragging: action.dragging
        }
    };

    let snap = action.snap;
    if (snap) {
        for (let item of state.selection.items) {
            if (item.type === "node") {
                let n = newState.nodes[item.key];
                newState.nodes[item.key] = {
                    ...n,
                    x: Math.round(n.x / snap) * snap,
                    y: Math.round(n.y / snap) * snap
                };
            }
        }
    }

    return newState;
}

export default lookupReducerFactory({ SET_SELECTION, CHANGE_SELECTION, DELETE_SELECTION, REGISTER_SELECTABLE, UNREGISTER_SELECTABLE, SELECT_ALL, MOVE_SELECTION, SELECT_RECT, SET_DRAGGING });