import graphs from "./graphs";
import { toast } from "react-toastify";
import buildProject from "./compileProject";

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
        graphs: {},
        projectId: undefined
    };

    dispatch({type: "LOAD_PROJECT", data});
    dispatch({type: "SET_FOCUS", focus: { projectId: data.projectId } });
}

function serializeObp(data) {
    let {path, ...project} = data;

    let newGraphs = {};
    for (let [id, graph] of Object.entries(project.graphs))
        newGraphs[id] = graphs.packForSerialization(graph);

    let obpData = {
        ...project,
        graphs: newGraphs
    };

    return JSON.stringify(obpData, null, 2);
}

async function openProject(obpPath, dispatch) {
    let data = null;

    try {
        let obp = await util.promisify(fs.readFile)(obpPath, "utf-8");
        data = deserializeObp(obp, obpPath);
        dispatch({type: "LOAD_PROJECT", data});
        dispatch({type: "SET_FOCUS", focus: { projectId: data.projectId } });
    } catch (e) {
        toastErr("Unable to open that project", e);
        return;
    }

    let packs = await getPackages(data.path);
    for (let data of Object.values(packs)) {
        dispatch({type: "LOAD_PROJECT", data});
    }
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

async function save(project) {
    let obp = serializeObp(project);

    let folderPath = project.path;
    let obpPath = path.join(folderPath, project.name + ".obp");

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
        toast("Saved " + project.name + ".obp", {type: "success"});
    } catch (e) {
        toastErr("Unable to save obp file", e);
    }
}
        

async function importPackage(obpPath, targetProjectPath) {
    let sourceProject = path.dirname(obpPath);
    let importingName = path.basename(obpPath, ".obp");
    let targetDirectory = path.join(targetProjectPath, "pack")
    let targetProject = path.join(targetDirectory, importingName);
    
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

function build(loadedProjects, projectId) {
    return buildProject(loadedProjects, projectId);
}

export default {
    readRecents,
    addRecent,
    openProject,
    newProject,
    save,
    serializeObp,
    deserializeObp,
    importPackage,
    getPackages,
    build
};
