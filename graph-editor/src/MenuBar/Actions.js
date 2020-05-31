import compileApp from "../Editors/Graph/compile";
import { ActionCreators } from 'redux-undo';
import graphs from "../logic/graphs";
import projects from "../logic/projects";
const { dialog } = window.require("electron").remote;
const child_process = window.require('child_process');
const remote = window.require("electron").remote;


function newGraph(state, dispatch) {
    graphs.showNewGraph(dispatch);
}

function save(state, dispatch) {
    projects.save(state);
}

function exportProject(state, dispatch) {
    save(state, dispatch);
    let [zip, name] = compileApp(state);

    dialog.showSaveDialog({
        defaultPath: name + ".obn",
        filters: [{name: "Obsidian Node File", extensions: ["obn"]}]
    }).then(({ filePath }) => {
        if (filePath)
            zip.writeZip(filePath);
    });
}

/*
function importNode(state, dispatch) {
    dialog.showOpenDialog({
        filters: [{name: "Obsidian Graph File", extensions: ["obg"]}],
        properties: ["openFile", "multiSelections"]
    }).then(result => {
        if (result.canceled)
            return;

        for (let path of result.filePaths) {
            nodes.importObg(path, dispatch);
        }
    });
}*/

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
    save,
    undo,
    redo,
    showGLIB,
    refresh,
    exit,
    devtools,
    selectAll,
    copy,
    paste,
    duplicate,
    exportProject
};
