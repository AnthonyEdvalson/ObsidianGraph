// ES5 imports used to fix conflict between electron and browserify
const fs = window.require("fs");
const { dialog } = window.require("electron").remote;


function open(state, dispatch) {
    dialog.showOpenDialog({
        filters: [{name: "Obsidian Node Files", extensions: ["obn"]}],
        properties: ["openFile"]
    }).then(result => {
        if (result.canceled)
            return;

        fs.readFile(result.filePaths[0], (err, data) => {
            if (err)
                throw err;

            console.log(JSON.parse(data));
            dispatch({type: "LOAD_GRAPH", data: JSON.parse(data)});
        })
    });
}

function save(state, dispatch) {
    let data = JSON.stringify({
        nodes: state.nodes,
        ports: state.ports,
        links: state.links
    });

    dialog.showSaveDialog({
        filters: [{name: "Obsidian Node Files", extensions: ["obn"]}]
    }).then(result => {
        console.log(result)
        console.log(fs);
        if (result.filePath)
            fs.writeFile(result.filePath, data, () => {});
    });
}


export default {
    open,
    save,
    undo: () => {},
    redo: () => {}
}
