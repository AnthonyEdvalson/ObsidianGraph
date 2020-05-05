import { createStore } from 'redux';
import undoable, { excludeAction } from 'redux-undo';

import graphActions from './actions/graph';
import nodeActions from './actions/node';
import portActions from './actions/port';
import linkActions from './actions/link';
import selectionActions from './actions/selection';
import libraryActions from './actions/library';
import modalActions from './actions/modal';
import clipboardActions from './actions/clipboard';


const init = {
    graph: {},
    modals: {
        newGraph: false,
        openGraph: true,
    },
    library: {
        path: "C:\\Users\\tonye\\Documents\\ObsidianProjects",
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
            "START_LINK": () => action.transaction,
            "RELINK": () => action.transaction,
            "END_LINK": () => previousHistory.present.newLink.transaction,
            "SELECT_RECT": () => "SELECT_RECT"
        };
        
        let t = action.type;
        return t in groups ? groups[t]() : null;
    },
    filter: excludeAction(["SAVE_GRAPH", "REGISTER_SELECTABLE", "UNREGISTER_SELECTABLE"])
});

function rootReducer(state=init, action) {
    let showDebug = ["MOVE_SELECTION", "MOVE_GRAPH", "SELECT_RECT", "REGISTER_SELECTABLE", "UNREGISTER_SELECTABLE"].indexOf(action.type) === -1;
    if (showDebug)
        console.log(action);

    let newState = {
        ...state,
        graph: graphReducer(state.graph, action, state),
        modals: lookupReducer(modalActions)(state.modals, action),
        library: lookupReducer(libraryActions)(state.library, action),
        clipboard: lookupReducer(clipboardActions)(state.clipboard, action, state)
    };

    if (showDebug)
        console.log(newState);

    return newState;
}


const store = createStore(rootReducer);


export default store;
