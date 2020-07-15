import { createStore, combineReducers } from 'redux';
import projectReducer from './reducers/project';
import focusReducer from './reducers/focus';
import { indexedReducerFactory } from './reducers/util';
import { graft } from "./util";

function projectsReducer(state={}, action, fullState) {
    if (action.type === "LOAD_PROJECT")
        return graft(state, action.data.projectId, action.data);

    return indexedReducerFactory(projectReducer, "projectId")(state, action, fullState);
}

let reducers = {
    projects: projectsReducer,
    focus: focusReducer
};

let mainReducer = combineReducers(reducers);

function rootReducer(state, action) {
    let showDebug = true;//["MOVE_SELECTION", "MOVE_GRAPH", "SELECT_RECT", "REGISTER_SELECTABLE", "UNREGISTER_SELECTABLE", "SET_DRAGGING"].indexOf(action.type) === -1;
    if (showDebug)
        console.log(action);
        
    let newState = mainReducer(state, action, state);

    if (showDebug) {
        let currentGraph = null;
        let { projectId, graphId } = newState.focus;

        if (projectId && graphId)
            currentGraph = newState.projects[projectId].graphs[graphId].present;

        console.log(newState, currentGraph);
    }

    return newState;
}

const store = createStore(rootReducer);

export default store;
