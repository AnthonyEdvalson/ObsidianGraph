function SET_LIBRARY(state, action) {
    return {
        ...state,
        contents: action.data
    };
}

export default { SET_LIBRARY };
