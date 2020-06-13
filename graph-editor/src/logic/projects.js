import graphs from "./graphs";
import { toast } from "react-toastify";

const ncp = window.require("ncp").ncp;
const fs = window.require("fs");
const path = window.require("path");
const util = window.require("util");

async function toastErr(msg, e) {
    toast(msg + ": " + e, {type: "error"});
}

async function readRecents(recentPath) {
    let recents;

    try {
        recents = await util.promisify(fs.readFile)(recentPath, "utf-8");
    } catch (e) {
        toastErr("Could not load recent projects", e);
        return [];
    }

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

    try {
        await util.promisify(fs.writeFile)(recentPath, JSON.stringify(newRecents));
    } catch (e) {
        toastErr("Could not add project to recently opened", e);
    }

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
        path: folderPath,
        graphs: {}
    };

    dispatch({type: "LOAD_PROJECT", data});
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
    try {
        let obp = await util.promisify(fs.readFile)(obpPath, "utf-8");
        let data = deserializeObp(obp, obpPath);
        dispatch({type: "LOAD_PROJECT", data});
    } catch (e) {
        toastErr("Unable to open that project", e);
    }

    return await addRecent(obpPath, recents, recentPath);
}

function deserializeObp(obp, obpPath) {
    let obpData = JSON.parse(obp);
    let project = { path: path.dirname(obpPath), ...obpData };

    let newGraphs = {};
    for (let [id, graph] of Object.entries(obpData.graphs))
        newGraphs[id] = graphs.unpackFromSerialization(graph, id);

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
        try {
            await util.promisify(fs.mkdir)(folderPath, { recursive: true });
        } catch (e) {
            toastErr("Unable to create project folder", e);
            return;
        }
    }

    try {
        await util.promisify(fs.writeFile)(obpPath, obp);
        toast("Saved " + state.project.name + ".obp", {type: "success"});
    } catch (e) {
        toastErr("Unable to save obp file", e);
    }
}
        

async function importPackage(obpPath, targetProjectPath) {
    let sourceProject = path.dirname(obpPath);
    let importingName = path.basename(obpPath, ".obp");
    let targetDirectory = path.join(targetProjectPath, "pack")
    let targetProject = path.join(targetDirectory, importingName);
    console.log(sourceProject, importingName, targetDirectory, targetProject);
    
    try {
        if (!fs.existsSync(targetDirectory))
            await util.promisify(fs.mkdir)(targetDirectory);

        if (!fs.existsSync(targetProject))
            await util.promisify(fs.mkdir)(targetProject);

        await util.promisify(ncp)(sourceProject, targetProject);
        toast("Imported " + importingName, {type: "success"});
    }
    catch (e) {
        toastErr("Could not import " + importingName, e);
        throw e;
    }

    //let obp = await util.promisify(fs.readFile)(obpPath, "utf-8");
    //let data = deserializeObp(obp, obpPath);

    //dispatch({type: "IMPORT_PROJECT", data});

    //return await addRecent(obpPath, recents, recentPath);
}

async function getPackages(projectPath) {
    let packFolder = path.join(projectPath, "pack");
    let packNames = await util.promisify(fs.readdir)(packFolder);

    let packs = {}
    for (let packName of packNames) {
        if (packName[0] === ".")
            continue;

        let obpPath = path.join(packFolder, packName, packName + ".obp");
        let obp = await util.promisify(fs.readFile)(obpPath, "utf-8");
        let data = deserializeObp(obp, obpPath);

        packs[packName] = data;
    }
    return packs;
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
    deserializeObp,
    importPackage,
    getPackages
};
