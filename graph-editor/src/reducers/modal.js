import { makeLookupReducer } from "./util";

function SET_MODAL_OPEN(state, action) {
    let newState = { ...state };
    newState[action.name] = action.open;
    
    return newState;
}

export default makeLookupReducer({ SET_MODAL_OPEN }, { newGraph: false, openProject: true, newProject: false, editNode: false });
