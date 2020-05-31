import { createStore, combineReducers } from 'redux';
import libraryReducer from './reducers/library';
import modalReducer from './reducers/modal';
import clipboardReducer from './reducers/clipboard';
import projectReducer from './reducers/project';

let reducers = {
    modals: modalReducer,
    library: libraryReducer,
    clipboard: clipboardReducer,
    project: projectReducer
};

function rootReducer(state, action) {
    let showDebug = ["MOVE_SELECTION", "MOVE_GRAPH", "SELECT_RECT", "REGISTER_SELECTABLE", "UNREGISTER_SELECTABLE", "SET_DRAGGING"].indexOf(action.type) === -1;
    if (showDebug)
        console.log(action);

    let newState = combineReducers(reducers)(state, action);

    if (showDebug)
        console.log(newState);

    return newState;
}


const store = createStore(rootReducer);


export default store;
