import { lookupReducerFactory } from "./util";

let init = {
    graphId: null,
    projectId: null,
    errorId: null
}

function SET_FOCUS(state, action) {
    return { ...state, ...action.focus };
}

export default lookupReducerFactory({ SET_FOCUS }, init);
