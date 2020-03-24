import linkActions from './link';
import portActions from './port';

function SET_SELECTION(state, action) {
    let newState = {
        ...state,
    };

    newState.selection = action.items;

    return newState;
}


function CHANGE_SELECTION(state, action) {
    let newState = {
        ...state
    }

    let select = newState.selection[0];

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
    let newState = {...state};

    for (let item of state.selection) {
        if (item.type === "node") {
            let target = state.nodes[item.key];
            
            if (target.output)
                newState = portActions.DELETE_PORT(newState, {key: target.output.key});
            for (let input of target.inputs)
                newState = portActions.DELETE_PORT(newState, {key: input.key});
    
            newState.nodes = {...newState.nodes};
            delete newState.nodes[item.key];
        }
        if (item.type === "link") {
            newState.links = {...newState.links};
            newState = linkActions.DELETE_LINK(newState, {sink: item.key});
        }
    }

    newState.selection = [];

    return newState;
}


export default { SET_SELECTION, CHANGE_SELECTION, DELETE_SELECTION };