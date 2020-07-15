const fs = window.require("fs");

function importObg(path, dispatch) {
    fs.readFile(path, (err, data) => {
        if (err) throw err;
        dispatch({type: "NEW_NODE", nodeType: "graph", data: JSON.parse(data), path});
    });
}

export { importObg };
