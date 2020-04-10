import linkActions from './link';
import portActions from './port';
import { getFilePath } from '../useFile';
const fs = window.require("fs");


function SET_SELECTION(state, action) {
    let newState = {
        ...state,
        selection: { ...state.selection }
    };

    if (action.ctrl)
        newState.selection.items = [...state.selection.items, ...action.items];
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
        newState.nodes = {...newState.nodes};
        let oldNode = newState.nodes[select.key];
        newState.nodes[select.key] = action.change(oldNode);
    }
    else if (select.type === "graph") {
        newState.meta = {...newState.meta};
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
            let target = state.nodes[item.key];
            
            if (target.output)
                newState = portActions.DELETE_PORT(newState, {key: target.output});
            for (let key of target.inputs)
                newState = portActions.DELETE_PORT(newState, {key});
    
            newState.nodes = {...newState.nodes};
            delete newState.nodes[item.key];

            let filePath = getFilePath(target.name, target.type, state.path);
            if (filePath) {
                fs.unlink(filePath, err => {
                    if (err) throw err;
                });
            }
        }
        if (item.type === "link") {
            newState.links = {...newState.links};
            newState = linkActions.DELETE_LINK(newState, {sink: item.key});
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

    newState.selection.all = newState.selection.all.filter(item => item.type === action.item.type && item.key === action.item.key);
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
    let gt = state.transform;
    let newState = {...state, nodes: {...state.nodes}};

    for (let item of state.selection.items) {
        if (item.type === "node") {
            let n = newState.nodes[item.key];
            newState.nodes[item.key] = {
                ...n,
                x: n.x + action.dx / gt.scale,
                y: n.y + action.dy / gt.scale
            };
        }
    }

    return newState;
}


export default { SET_SELECTION, CHANGE_SELECTION, DELETE_SELECTION, REGISTER_SELECTABLE, UNREGISTER_SELECTABLE, SELECT_ALL, MOVE_SELECTION };