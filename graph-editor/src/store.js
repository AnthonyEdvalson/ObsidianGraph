import { createStore } from 'redux';
import undoable, { excludeAction } from 'redux-undo';

import graphActions from './actions/graph';
import nodeActions from './actions/node';
import portActions from './actions/port';
import linkActions from './actions/link';
import selectionActions from './actions/selection';
import libraryActions from './actions/library';
import modalActions from './actions/modal';


const init = {
    graph: {
        path: null,
        meta: {
            name: "Obsidian",
            author: "",
            description: "",
            hideInLibrary: true,
            tags: ""
        },
        nodes: { },
        ports: { },
        links: { },
        newLink: null,
        selection: []
    },
    modals: {
        newGraph: false,
        openGraph: true,
    },
    library: {
        path: "C:\\Users\\tonye\\Documents\\ObsidianProjects",
        contents: null
    }
}


function lookupReducer(lookup) {
    return (state, action) => {
        if (action.type in lookup) {
            let newState = lookup[action.type](state, action);
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
            "MOVE_NODE": () => action.node,
            "MOVE_PORT": () => currentState.ports[action.port].node,
            "START_LINK": () => action.transaction,
            "RELINK": () => action.transaction,
            "END_LINK": () => previousHistory.present.newLink.transaction
        };
        console.log(previousHistory)
        let t = action.type;
        console.log(t in groups ? groups[t]() : null);
        return t in groups ? groups[t]() : null;
    },
    filter: excludeAction(["SAVE_GRAPH"])
});

function rootReducer(state=init, action) {
    console.log(action);
    let newState = {
        ...state,
        graph: graphReducer(state.graph, action),
        modals: lookupReducer({...modalActions})(state.modals, action),
        library: lookupReducer({...libraryActions})(state.library, action)
    };

    console.log(newState);
    return newState;
}


const store = createStore(rootReducer);


export default store;
