const fs = window.require("fs");
const util = window.require("util");

async function openGraph(obgPath, dispatch) {
    let obg = await util.promisify(fs.readFile)(obgPath, "utf-8");
    dispatch({type: "LOAD_GRAPH", data: JSON.parse(obg), filePath: obgPath});
}

function newGraph(dispatch, directory, name) {
    dispatch({type: "NEW_GRAPH", directory, name});
}

function showNewGraph(dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "newGraph", open: true});
}
function hideNewGraph(dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "newGraph", open: false});
}

export default {
    openGraph,
    newGraph,
    showNewGraph,
    hideNewGraph
}