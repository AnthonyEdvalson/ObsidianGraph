import { makeLookupReducer } from "./util";
const path = window.require("path");

function SET_LIBRARY(state, action) {
    return {
        ...state,
        contents: action.data
    };
}

export default makeLookupReducer({ SET_LIBRARY }, { contents: null, path: path.join("/Users/tonyedvalson", "Documents", "ObsidianProjects") });
