import { createStore } from 'redux';
import undoable, { excludeAction } from 'redux-undo';
import path from 'path';
/*
import graphActions from './actionsX/graph';
import nodeActions from './actionsX/node';
import portActions from './actionsX/port';
import linkActions from './actionsX/link';
import selectionActions from './actionsX/selection';
import libraryActions from './actionsX/library';
import modalActions from './actionsX/modal';
import clipboardActions from './actionsX/clipboard';
import projectAction from './actionsX/project';

const init = {
    project: null,
    modals: {
        newGraph: false,
        //openGraph: true,
        openProject: true,
        newProject: false,
        editNode: false
    },
    library: {
        path: path.join(/*os.homedir()/ "/Users/tonyedvalson", "Documents", "ObsidianProjects"),
        contents: null
    },
    clipboard: {
        nodes: {},
        ports: {},
        links: {}
    }
}


function lookupReducer(lookup) {
    return (state, action, ...rest) => {
        if (action.type in lookup) {
            let newState = lookup[action.type](state, action, ...rest);
            if (typeof(newState) === "undefined")
                throw new Error(`${action.type} returned undefined`);
            return newState;
        }
        return state;
    }
}

let graphReducer = undoable(lookupReducer({...graphActions, ...nodeActions, ...portActions, ...linkActions, ...selectionActions}), {
    limit: 1000,
    groupBy: (action, currentState, previousHistory) => { 
        let groups = {
            "MOVE_SELECTION": () => "MOVE",
            "MOVE_GRAPH": () => "MOVE",
            "SET_DRAGGING": () => "MOVE",
            "START_LINK": () => action.transaction,
            "RELINK": () => action.transaction,
            "END_LINK": () => previousHistory.present.newLink.transaction,
            "SELECT_RECT": () => "SELECT_RECT"
        };
        
        let t = action.type;
        return t in groups ? groups[t]() : null;
    },
    filter: excludeAction(["REGISTER_SELECTABLE", "UNREGISTER_SELECTABLE"])
});

function rootReducer(state=init, action) {
    let showDebug = ["MOVE_SELECTION", "MOVE_GRAPH", "SELECT_RECT", "REGISTER_SELECTABLE", "UNREGISTER_SELECTABLE", "SET_DRAGGING"].indexOf(action.type) === -1;
    if (showDebug)
        console.log(action);

    let newState = {
        ...state,
        graph: graphReducer(state.graph, action, state),
        modals: lookupReducer(modalActions)(state.modals, action),
        library: lookupReducer(libraryActions)(state.library, action),
        clipboard: lookupReducer(clipboardActions)(state.clipboard, action, state),
        project: lookupReducer(projectAction)(state.project, action)
    };

    if (showDebug)
        console.log(newState);

    return newState;
}


const store = createStore(rootReducer);


export default store;
*/