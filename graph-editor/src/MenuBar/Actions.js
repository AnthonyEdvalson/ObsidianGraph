import compileApp from "../Graph/compile";
import { ActionCreators } from 'redux-undo';

// ES5 imports used to fix conflict between electron and browserify
const fs = window.require("fs");
const { dialog } = window.require("electron").remote;
const admZip = window.require("adm-zip");
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
    let zip = new admZip();

    let compGraph = compileApp(state.graph.present, zip);

    zip.addFile("front.json", JSON.stringify({nodes: compGraph.front, output: compGraph.output}, null, 2));
    zip.addFile("back.json", JSON.stringify({nodes: compGraph.back}, null, 2));
    zip.addFile("meta.json", JSON.stringify(compGraph.meta, null, 2));
    
    /*zipdir(path.join(state.graph.present.path, "node_modules"), (err, buf) => {
        if (err) throw err;
        zip.file("packages.zip", buf, { compression: "STORE", binary: true, date: new Date("December 25, 2007, 00:00:01") });

        dialog.showSaveDialog({
            defaultPath: state.graph.present.meta.name + ".obn",
            filters: [{name: "Obsidian Node Files", extensions: ["obn"]}]
        }).then(result => {
            if (result.filePath)
                zip.generateNodeStream({compression:"DEFLATE"}).pipe(fs.createWriteStream(result.filePath));
        });
    })*/

    //zip.addFile("packages.zip", buf, { compression: "STORE", binary: true, date: new Date("December 25, 2007, 00:00:01") });

    dialog.showSaveDialog({
        defaultPath: state.graph.present.meta.name + ".obn",
        filters: [{name: "Obsidian Node Files", extensions: ["obn"]}]
    }).then(({ filePath }) => {
        if (filePath)
            zip.writeZip(filePath);
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

function devtools(state, dispatch) {
    remote.getCurrentWindow().webContents.openDevTools();
}

function selectAll(state, dispatch) {
    dispatch({type: "SELECT_ALL"});
}

function copy(state, dispatch) {
    dispatch({type: "COPY"});
}

function paste(state, dispatch) {
    dispatch({type: "PASTE"});
}

function duplicate(state, dispatch) {
    dispatch({type: "DUPLICATE"});
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
    exit,
    devtools,
    selectAll,
    copy,
    paste,
    duplicate
};
