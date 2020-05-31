import { uuid4 } from "./node";
import { makeLookupReducer } from "./util";
import undoable, { excludeAction } from 'redux-undo';
import graphReducer from './graph';
import nodeReducer from './node';
import portReducer from './port';
import linkReducer from './link';
import selectionReducer from './selection';


function LOAD_PROJECT(state, action) {
    let newState = {
        ...action.data
    };

    return newState;
}

function NEW_GRAPH(state, action) {
    let data = {/*
        future: [],
        group: null,
        index: 1,
        limit: 100,
        past: [],
        present: {*/
            meta: {
                name: action.name,
                tags: "",
                hideInLibrary: false
            },
            nodes: {},
            links: {},
            ports: {}
        /*},
        _latestUnfiltered: undefined*/
    };

    let key = uuid4();

    let newState = {
        ...state,
        graphs: {...state.graphs}
    };

    newState.graphs[key] = data;
    return newState;
}

function LOAD_GRAPH(state, action) {
    let newState = {
        ...state,
        openGraph: action.key
    };

    return newState;
}







function graphsReducer(state, action) {
    let newState = state;
    if (!state)
        return {};

    for (let [k, v] of Object.entries(state)) {
        if (typeof(action.graphId) === "undefined" || k === action.graphId)
            newState[k] = graphSuperReducer(v, action);
    }
    return newState;
}
/*
let graphSuperReducer = undoable(lookupReducer({...graphReducer, ...nodeReducer, ...portReducer, ...linkReducer, ...selectionReducer}), {
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
*/

let graphSuperReducer = undoable((state, action) => {
        let r = graphReducer(state, action);
        r = nodeReducer(r, action);
        r = portReducer(r, action);
        r = linkReducer(r, action);
        r = selectionReducer(r, action);
        return r;
    }, 
    {
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

function projectReducer(state, action) {
    let r = makeLookupReducer({ LOAD_PROJECT, NEW_GRAPH, LOAD_GRAPH }, null)(state, action);
    if (r)
        r.graphs = graphsReducer(r.graphs, action);

    return r;
}

export default projectReducer;
