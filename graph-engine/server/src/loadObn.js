import fs from 'fs';
import util from 'util';
import { cli } from 'obsidian';
import zipUtil from './zipUtil';

let mkdir = util.promisify(fs.mkdir);
let writeFile = util.promisify(fs.writeFile);

async function loadObn(obnPath, frontFolder, backFolder) {
    let allEntries;

    try {
        allEntries = zipUtil.pullAllEntries(obnPath).contents;
    }
    catch (err) {
        cli.warn("loadObn", "Could not load " + obnPath + " Because of the following error:");
        cli.warn("loadObn", "  " + err.stack);
    }

    let projects = []

    for (let [name, item] of Object.entries(allEntries)) {
        if (item.type === "dir") {
            cli.log("loadObn", `Loading ${name}...`);
            await loadProject(item.contents, frontFolder, backFolder, item);
            projects.push(name);
        }
    }

    let appData = allEntries["app.json"].entry.getData().toString("utf-8");

    if (frontFolder) {
        await writeFile(frontFolder + "appData.json", appData);
        await writeFile(frontFolder + "index.js", makeAppIndex());
    }
    if (backFolder) {
        await writeFile(backFolder + "appData.json", appData);
        await writeFile(backFolder + "index.js", makeAppIndex());
    }

    cli.log("loadObn", obnPath + " has been loaded");
}

function makeAppIndex() {
    return `import appData from './appData.json';

let functions = {};

for (let p of appData.projects)
    functions = { ...functions, ...require("./" + p).default.functions };

export default {
    ...appData,
    functions
};
`
}

async function loadProject(projectData, frontFolder, backFolder) {
    let data = JSON.parse(projectData["project.json"].entry.getData().toString("utf-8"));
    let css = projectData["project.css"].entry.getData().toString("utf-8");

    if (frontFolder)
        await loadProjectSide(data, "F", frontFolder, projectData["front_node_modules"], css);
    
    if (backFolder)
        await loadProjectSide(data, "B", backFolder, projectData["back_node_modules"]);
}

async function loadProjectSide(project, side, folder, node_modules, css) {
    let folderPath = folder + project.name + "/";
    await mkdir(folderPath, { recursive: true });

    if (side === "F") {
        await writeFile(folderPath + "project.css", css);
    }

    let data = { 
        functions: {},
        name: project.name 
    };

    for (let fDef of Object.values(project.functions))
        await loadFunction(fDef, side, data, folderPath);

    await writeFile(folderPath + "projectData.json", JSON.stringify(data, null, 2));
    await writeFile(folderPath + "index.js", makeProjectIndex(side === "F"));

    if (node_modules)
        await zipUtil.extract(node_modules, folderPath + "node_modules/");
    
    return data;
}

function makeProjectIndex(includeCSS) {
    return `import projectData from './projectData';
import { util } from 'obsidian';
${includeCSS ? "\nimport './project.css'" : ""};


export default {
    ...projectData,
    functions: util.transform(projectData.functions, f => {
        let fDef = { ...f };

        if (f.type === "code")
            fDef.module = require("./" + f.name).default;
        
        return fDef;
    })
};
`
}

async function loadFunction(def, side, data, folderPath) {
    if (def.sides.includes(side)) {
        data.functions[def.functionId] = def;

        if (def.type === "code")
            await writeFile(folderPath + def.name + ".js", def.content);
    }
    else {
        console.log(def.functionId, def.inputs);
        data.functions[def.functionId] = {
            type: "remote",
            functionId: def.functionId,
            name: def.name,
            inputs: def.inputs
        };
    }
}

module.exports = loadObn;
