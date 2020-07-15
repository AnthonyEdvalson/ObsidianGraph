function SET_MODAL_OPEN(state, action) {
    let newState = { ...state };

    newState[action.name] = action.open;

    return newState;
}

export default { SET_MODAL_OPEN };
