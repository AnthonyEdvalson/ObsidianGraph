import graphs from "./graphs";
import { toast } from "react-toastify";
import buildProject from "./compileProject";
import { util as obsidianUtil } from 'obsidian';
import version from '../logic/version';

const ncp = window.require("ncp").ncp;
const fs = window.require("fs").promise;
const path = window.require("path");
const util = window.require("util");

async function toastWarn(msg) {
    console.warn(msg);
    toast(msg, {type: "warn"});
}

async function toastErr(msg, e) {
    console.error(e);
    toast(msg + ": " + e, {type: "error"});
}

async function readRecents(recentPath) {
    let recents;

    try {
        recents = await fs.readFile(recentPath, "utf-8");
    } catch (e) {
        toastErr("Could not load recent projects", e);
        return [];
    }

    return JSON.parse(recents);
}

async function addRecent(appPath, recents, recentPath) {
    let newRecent = {
        name: path.basename(appPath, "json"), 
        path: appPath, 
        date: new Date().toLocaleString()
    };

    let newRecents = [newRecent];
    for (let recent of recents) {
        if (recent.path !== newRecent.path && newRecents.length < 5)
            newRecents.push(recent);
    }

    try {
        await fs.writeFile(recentPath, JSON.stringify(newRecents));
    } catch (e) {
        toastErr("Could not add project to recently opened", e);
    }

    return newRecents;
}

async function newProject(dispatch, directory, name, author, description) {
    let folderPath = path.join(directory, name);
    let appPath = path.join(folderPath, name + ".json");

    let data = {
        name,
        author,
        description,
        tags: "",
        hideInLibrary: false,
        path: folderPath,
        graphs: {},
        projectId: obsidianUtil.uuid4()
    };

    await save(data);
    await openProject(appPath, dispatch);
}

function serializeApp(data) {
    let {path, ...project} = data;

    let newGraphs = {};
    for (let [id, graph] of Object.entries(project.graphs))
        newGraphs[id] = graphs.packForSerialization(graph);

    let appData = {
        ...project,
        graphs: newGraphs
    };

    return JSON.stringify(appData, null, 2);
}

async function openProject(projectPath, dispatch) {
    let data = null;

    try {
        let appPath = path.join(projectPath, "app.js");
        let app = await fs.readFile(appPath, "utf-8");
        data = await deserializeApp(app, projectPath);
        dispatch({type: "LOAD_PROJECT", data});
        dispatch({type: "SET_FOCUS", focus: { projectId: data.projectId, rootProjectId: data.projectId } });
    } catch (e) {
        toastErr("Unable to open that project", e);
        return;
    }

    let packs = await getPackages(data.path);
    for (let data of Object.values(packs)) {
        dispatch({type: "LOAD_PROJECT", data});
    }
}

async function deserializeApp(app, appPath, ingoreOutdated) {
    let appData = JSON.parse(app);

    if (version.outdated(appData.v)) {
        if (ingoreOutdated)
            return null;

        // example/project.json -> example/project_v1_0_2.obn.bak
        let backupPath = appPath.replace(/\.[^/.]+$/, "") + "_v" + appData.v.toString().replace(".", "_") + ".bak.json";
        await backup(appPath, backupPath);
        toastWarn(path.basename(appPath) + " is outdated, a backup has been made at " + path.basename(backupPath));

        appData = version.upgrade(appData);
    }

    let project = { path: path.dirname(appPath), ...appData };

    let newGraphs = {};
    for (let [id, graph] of Object.entries(appData.graphs))
        newGraphs[id] = graphs.unpackFromSerialization(graph, id);

    // Save before return???
    return {
        ...project,
        graphs: newGraphs
    };
}

async function save(project) {
    let app = serializeApp(project);

    let projectPath = project.path;
    let appPath = path.join(projectPath, project.name + ".json");

    let folders = ["", "pack/", "front/", "back/"]

    for (let folder of folders) {
        let folderPath = path.join(projectPath, folder);

        if (!fs.existsSync(folderPath)) {
            try {
                await fs.mkdir(folderPath, { recursive: true });
            } catch (e) {
                toastErr("Unable to create folder " + folderPath, e);
                console.error(e);
                return;
            }
        }
    }

    try {
        await backup(appPath, appPath + ".bak");
        await fs.writeFile(appPath, app);
        toast("Saved " + project.name + ".json", {type: "success"});
    } catch (e) {
        toastErr("Unable to save obp file", e);
    }
}

async function backup(src, dest) {
    if (src && fs.existsSync(src))
        await fs.copyFile(src, dest, fs.constants.COPYFILE_FICLONE);
}
        

async function importPackage(appPath, targetProjectPath) {
    let sourceProject = path.dirname(appPath);
    let importingName = path.basename(appPath, ".json");
    let targetDirectory = path.join(targetProjectPath, "pack")
    let targetProject = path.join(targetDirectory, importingName);
    
    try {
        if (!fs.existsSync(targetDirectory))
            await fs.mkdir(targetDirectory);

        if (!fs.existsSync(targetProject))
            await fs.mkdir(targetProject);

        await util.promisify(ncp)(sourceProject, targetProject);
        toast("Imported " + importingName, {type: "success"});
    }
    catch (e) {
        toastErr("Could not import " + importingName, e);
        throw e;
    }

    //let obp = await util.promisify(fs.readFile)(obpPath, "utf-8");
    //let data = await deserializeObp(obp, obpPath);

    //dispatch({type: "IMPORT_PROJECT", data});

    //return await addRecent(obpPath, recents, recentPath);
}

async function getPackages(projectPath) {
    let packFolder = path.join(projectPath, "pack");
    let packNames = await fs.readdir(packFolder);

    let packs = {}
    for (let packName of packNames) {
        if (packName[0] === ".")
            continue;

        let appPath = path.join(packFolder, packName, packName + ".json");
        let app = await fs.readFile(appPath, "utf-8");
        let data = await deserializeApp(app, appPath);

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
    serializeApp,
    deserializeApp,
    importPackage,
    getPackages,
    build
};
