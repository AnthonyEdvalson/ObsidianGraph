import { createStore } from 'redux';
import projectReducer from './reducers/project';
import focusReducer from './reducers/focus';
import { indexedReducerFactory, combineReducers } from './reducers/util';
import { util } from 'obsidian';
import clipboardReducer from'./reducers/clipboard';


function errorReducer(state={}, action) {
    if (action.type === "NEW_ERROR")
        return util.graft(state, action.data.errorId, action.data);
    
    if (action.type === "SET_FOCUS" && action.errorId in state)
        state[action.errorId].new = false;
    
    return state;
}

function projectsReducer(state={}, action, fullState) {
    if (action.type === "LOAD_PROJECT")
        return util.graft(state, action.data.projectId, action.data);

    return indexedReducerFactory(projectReducer, "projectId")(state, action, fullState);
}

function profilesReducer(state={}, action, fullState) {
    if (action.type === "LOAD_PROFILE")
        return util.graft(state, action.data.id, action.data)
    
    return state;
    //return indexedReducerFactory(profileReducer, "id")(state, action, fullState);
}

let reducers = {
    projects: projectsReducer,
    errors: errorReducer,
    focus: focusReducer,
    profiles: profilesReducer,
    clipboard: clipboardReducer
};

let mainReducer = combineReducers(reducers);

function rootReducer(state, action) {
    let showDebug = ["MOVE_SELECTION", "MOVE_GRAPH", "SELECT_RECT", "REGISTER_SELECTABLE", "UNREGISTER_SELECTABLE", "SET_DRAGGING"].indexOf(action.type) === -1;
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
