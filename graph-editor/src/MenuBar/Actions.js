// ES5 imports used to fix conflict between electron and browserify
const fs = window.require("fs");
const { dialog } = window.require("electron").remote;
const { getDefaultParams } = require("../UI/Schema");
const JSZip = require("jszip");


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
    }, null, 2);

    dialog.showSaveDialog({
        defaultPath: state.graph.meta.name + ".obn",
        filters: [{name: "Obsidian Node Files", extensions: ["obn"]}]
    }).then(result => {
        if (result.filePath)
            fs.writeFile(result.filePath, data, () => {});
    });
}


function exportGraph(state, dispatch) {
/*    let zip = new JSZip();
    zip.file("app.obgf", );
    zip.file("app.obgb", );
    zip.folder("back");
    zip.folder("front");

    dialog.showSaveDialog({
        defaultPath: state.graph.meta.name + ".obg",
        filters: [{name: "Obsidian Node Files", extensions: ["obn"]}]
    }).then(result => {
        if (result.filePath)
            zip.generateNodeStream({}).pipe(fs.createWriteStream(result.filePath));
    });*/
}


function transformImportedGraph(graph, path) {    
    let data = {
        path,
        parameters: null,
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
            data.schema = JSON.parse(node.schema);
            data.parameters = getDefaultParams(data.schema);
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
    importNode,
    exportGraph
};
