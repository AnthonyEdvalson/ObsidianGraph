import { lookupReducerFactory, indexedReducerFactory } from "./util";
import graphReducer from './graph';

function ADD_GRAPH(state, action) {
    let newState = {
        ...state,
        graphs: { ...state.graphs }
    };

    newState.graphs[action.graphId] = action.data

    return newState;
}

function projectReducer(state, action, fullState) {
    let r = lookupReducerFactory({ ADD_GRAPH })(state, action, fullState);
    r.graphs = indexedReducerFactory(graphReducer, "graphId")(state.graphs, action, fullState);
    return r;
}

export default projectReducer;
