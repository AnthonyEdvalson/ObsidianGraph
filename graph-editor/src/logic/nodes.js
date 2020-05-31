function showEditNode(id, graphKey, dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "editNode", open: { id, graphKey }});
}

function closeEditNode(dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "editNode", open: false});
}

export default {
    showEditNode, 
    closeEditNode
};
