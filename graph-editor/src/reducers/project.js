import { lookupReducerFactory, indexedReducerFactory } from "./util";
import graphReducer from './graph';
import { util } from 'obsidian';
import graphs from "../logic/graphs";

function NEW_GRAPH(state, action) {
    let graphId = util.uuid4();

    let graph = graphs.unpackFromSerialization({}, graphId);
    graph.present.meta.name = action.name;

    return {
        ...state,
        graphs: { 
            ...state.graphs,
            [graphId]: graph
        }
    }
}

function projectReducer(state, action, fullState) {
    let r = lookupReducerFactory({ NEW_GRAPH })(state, action, fullState);
    r.graphs = indexedReducerFactory(graphReducer, "graphId")(r.graphs, action, fullState);
    return r;
}

export default projectReducer;
