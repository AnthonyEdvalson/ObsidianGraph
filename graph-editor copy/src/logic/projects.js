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

async function openProject(obpPath, dispatch, recents, recentPath) {
    let obp = await util.promisify(fs.readFile)(obpPath, "utf-8");
    
    dispatch({type: "LOAD_PROJECT", data: JSON.parse(obp), filePath: obpPath});

    return await addRecent(obpPath, recents, recentPath);
}

async function newProject(dispatch, directory, name, author, description) {
    dispatch({type: "NEW_PROJECT", directory, name, author, description});
}

export default {
    readRecents,
    addRecent,
    openProject,
    showOpenProject,
    hideOpenProject,
    showNewProject,
    hideNewProject,
    newProject
};
