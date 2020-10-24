import { lookupReducerFactory } from "./util"; 
import undoable, { excludeAction } from 'redux-undo';
import nodeReducer from './node';
import portReducer from './port';
import linkReducer from './link';
import selectionReducer from './selection';
import graphs from "../logic/graphs";

function SET_GRAPH_CSS(state, action) {
    let newState = {
        ...state,
        css: action.css
    };

    return newState;
}

let graphReducer = lookupReducerFactory({ SET_GRAPH_CSS });

// TODO bookmark undo, add a bookmark button, then you can jump back or forward to bookmarks in the undo stack
// The last 5 bookmarks are saved and will be preserved no matter what happens in the undo stack
let graphSuperReducer = undoable((state, action, fullState) => {
        let r = graphReducer(state, action, fullState);
        r = nodeReducer(r, action, fullState);
        r = portReducer(r, action, fullState);
        r = linkReducer(r, action, fullState);
        r = selectionReducer(r, action, fullState);

        if (action.type === "SET_SELECTION")
            r = graphs.refreshInterfaces(r, fullState);
        
        return r;
    }, 
    {
        limit: 100,
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
            let group = t in groups ? groups[t]() : null;
            return group;
        },
        filter: excludeAction(["REGISTER_SELECTABLE", "UNREGISTER_SELECTABLE"])
    }
);



export default graphSuperReducer;
