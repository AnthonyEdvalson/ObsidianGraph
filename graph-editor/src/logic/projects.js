import graphs from "./graphs";

const fs = window.require("fs");
const path = window.require("path");
const util = window.require("util");

async function readRecents(recentPath) {
    let recents = await util.promisify(fs.readFile)(recentPath, "utf-8");
    return JSON.parse(recents);
}

function showNewProject(dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "newProject", open: true});
}

function hideNewProject(dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "newProject", open: false});
}

function showOpenProject(dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "openProject", open: true});
}

function hideOpenProject(dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "openProject", open: false});
}

async function addRecent(obpPath, recents, recentPath) {
    let newRecent = {
        name: path.basename(obpPath, ".obp"), 
        path: obpPath, 
        date: new Date().toLocaleString()
    };

    let newRecents = [newRecent];
    for (let recent of recents) {
        if (recent.path !== newRecent.path && newRecents.length < 5)
            newRecents.push(recent);
    }
    
    await util.promisify(fs.writeFile)(recentPath, JSON.stringify(newRecents));
    return newRecents;
}

async function newProject(dispatch, directory, name, author, description) {
    let folderPath = path.join(directory, name);

    let data = {
        name,
        author,
        description,
        tags: "",
        hideInLibrary: false,
        graphs: {}
    };

    dispatch({type: "LOAD_PROJECT", data, folderPath});
}

function serializeObp(state) {
    let {path, ...project} = state.project;

    let newGraphs = {};
    for (let [id, graph] of Object.entries(state.project.graphs))
        newGraphs[id] = graphs.packForSerialization(graph);

    let obpData = {
        ...project,
        graphs: newGraphs
    };

    return JSON.stringify(obpData, null, 2);
}

async function openProject(obpPath, dispatch, recents, recentPath) {
    let obp = await util.promisify(fs.readFile)(obpPath, "utf-8");
    let data = deserializeObp(obp, obpPath);
    dispatch({type: "LOAD_PROJECT", data});

    return await addRecent(obpPath, recents, recentPath);
}

function deserializeObp(obp, obpPath) {
    let obpData = JSON.parse(obp);
    let project = { path: path.dirname(obpPath), ...obpData };

    let newGraphs = {};
    for (let [id, graph] of Object.entries(obpData.graphs))
        newGraphs[id] = graphs.unpackFromSerialization(graph);

    return {
        ...project,
        graphs: newGraphs
    }
}

async function save(state) {
    let obp = serializeObp(state);

    let folderPath = state.project.path;
    let obpPath = path.join(folderPath, state.project.name + ".obp");

    if (!fs.existsSync(folderPath)) {
        await util.promisify(fs.mkdir)(folderPath, { recursive: true });
    }

    await util.promisify(fs.writeFile)(obpPath, obp);
}

export default {
    readRecents,
    addRecent,
    openProject,
    showOpenProject,
    hideOpenProject,
    showNewProject,
    hideNewProject,
    newProject,
    save,
    serializeObp,
    deserializeObp
};
