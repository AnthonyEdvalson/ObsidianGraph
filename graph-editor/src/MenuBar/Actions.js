// ES5 imports used to fix conflict between electron and browserify
const fs = window.require("fs");
const { dialog } = window.require("electron").remote;


function newGraph(state, dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "newGraph", open: true})
}


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
        meta: state.graph.meta,
        nodes: state.graph.nodes,
        ports: state.graph.ports,
        links: state.graph.links
    });

    dialog.showSaveDialog({
        defaultPath: state.graph.meta.name + ".obn",
        filters: [{name: "Obsidian Node Files", extensions: ["obn"]}]
    }).then(result => {
        console.log(result)
        console.log(fs);
        if (result.filePath)
            fs.writeFile(result.filePath, data, () => {});
    });
}


function transformImportedGraph(graph, path) {
    let data = {
        path, 
        parameters: {}, 
        inputs:[], 
        output: null, 
        schema: null,
        name: graph.meta.name
    };

    for (let node of Object.values(graph.nodes)) {
        if (node.type === "in") {
            data.inputs.push(node.output);
        }

        if (node.type === "out") {
            data.output = node.inputs[0];
        }

        if (node.type === "edit") {
            data.schema = node.schema;
        }
    }
    
    return data;
}


function importNode(state, dispatch) {
    dialog.showOpenDialog({
        filters: [{name: "Obsidian Node Files", extensions: ["obn"]}],
        properties: ["openFile", "multiSelections"]
    }).then(result => {
        if (result.canceled)
            return;

        for (let path of result.filePaths) {
            fs.readFile(path, (err, data) => {
                if (err)
                    throw err;
    
                let graphData = transformImportedGraph(JSON.parse(data), path)
                dispatch({type: "NEW_NODE", nodeType: "graph", data: graphData});
            });
        }
    });
}

export default {
    new: newGraph,
    open,
    save,
    undo: () => {},
    redo: () => {},
    importNode
};
