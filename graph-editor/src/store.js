import { createStore } from 'redux';
import graphActions from './actions/graph';
import nodeActions from './actions/node';
import portActions from './actions/port';
import linkActions from './actions/link';
import selectionActions from './actions/selection';
import libraryActions from './actions/library';
import modalActions from './actions/modal';


const init = {
    graph: {
        meta: {
            name: "Obsidian",
            path: null,
            author: "",
            category: "",
            description: "",
            hideInLibrary: true,
            tags: ""
        },
        nodes: { },
        ports: { },
        links: { },
        newLink: { port: null, inout: null },
        selection: []
    },
    modals: {
        newGraph: false
    },
    library: null
}


function lookupReducer(state, action, lookup) {
    if (action.type in lookup) {
        let newState = lookup[action.type](state, action);
        if (typeof(newState) === "undefined")
            throw new Error(`${action.type} returned undefined`);
        return newState;
    }
    
    return state;
}

function rootReducer(state=init, action) {
    let newState = {
        ...state,
        graph: lookupReducer(state.graph, action, {...graphActions, ...nodeActions, ...portActions, ...linkActions, ...selectionActions}),
        modals: lookupReducer(state.modals, action, {...modalActions}),
        library: lookupReducer(state.library, action, {...libraryActions})
    };

    console.log(action);
    console.log(newState);
    return newState;
}


const store = createStore(rootReducer);


export default store;
