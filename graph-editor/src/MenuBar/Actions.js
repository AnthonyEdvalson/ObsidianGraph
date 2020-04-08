import compileGraph from "../Graph/compile";
import { ActionCreators } from 'redux-undo';

// ES5 imports used to fix conflict between electron and browserify
const fs = window.require("fs");
const { dialog } = window.require("electron").remote;
const JSZip = require("jszip");
const child_process = window.require('child_process');
const remote = window.require("electron").remote;


function newGraph(state, dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "newGraph", open: true});
}

function open(state, dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "openGraph", open: true});
}

function save(state, dispatch) {
    dispatch({type: "SAVE_GRAPH"});
}


/*function saveAs(state, dispatch) {
    dialog.showSaveDialog({
        defaultPath: state.graph.present.path,
        filters: [{name: "Obsidian Graph File", extensions: ["obg"]}]
    }).then(result => {
        if (result.filePath)
            dispatch({type: "SAVE_GRAPH", path: result.filePath});
    });
}*/



function exportGraph(state, dispatch) {
    let compGraph = compileGraph(state.graph.present);
    console.log(compGraph)

    let zip = new JSZip();
    zip.file("front.json", JSON.stringify({nodes: compGraph.front, output: compGraph.output}));
    zip.file("back.json", JSON.stringify({nodes: compGraph.back}));
    zip.file("meta.json", JSON.stringify(compGraph.meta));
    
    for (let [side, files] of Object.entries(compGraph.files)) {
        zip.folder(side);
        let ext = {front: ".js", back: ".py", resources: ".json"}[side];
        for (let [name, contents] of Object.entries(files)) {
            zip.file(side + "/" + name + ext, contents);
        }
    }

    dialog.showSaveDialog({
        defaultPath: state.graph.present.meta.name + ".obn",
        filters: [{name: "Obsidian Node Files", extensions: ["obn"]}]
    }).then(result => {
        if (result.filePath)
            zip.generateNodeStream({}).pipe(fs.createWriteStream(result.filePath));
    });
}


function importNode(state, dispatch) {
    dialog.showOpenDialog({
        filters: [{name: "Obsidian Graph File", extensions: ["obg"]}],
        properties: ["openFile", "multiSelections"]
    }).then(result => {
        if (result.canceled)
            return;

        for (let path of result.filePaths) {
            fs.readFile(path, (err, data) => {
                if (err) throw err;
                dispatch({type: "NEW_NODE", nodeType: "graph", data: JSON.parse(data), path});
            });
        }
    });
}

function showGLIB(state, dispatch) {
    child_process.exec(`start "" "${state.library.path}"`);
}

function refresh(state, dispatch) {
    remote.getCurrentWindow().reload();
}

function exit(state, dispatch) {
    remote.getCurrentWindow().close();
}

function undo(state, dispatch) {
    dispatch(ActionCreators.undo())
}

function redo(state, dispatch) {
    dispatch(ActionCreators.redo())
}

export default {
    new: newGraph,
    open,
    save,
    undo,
    redo,
    importNode,
    exportGraph,
    showGLIB,
    refresh,
    exit
};
