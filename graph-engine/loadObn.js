import admZip from 'adm-zip';
import fs from 'fs';
import util from 'util';

let mkdir = util.promisify(fs.mkdir);
let writeFile = util.promisify(fs.writeFile);
let copyFile = util.promisify(fs.copyFile);
let utimes = util.promisify(fs.utimes);


async function loadObn(obnPath) {
    let zip = new admZip(obnPath);
    let allEntries = pullAllEntries(zip).contents;

    const frontFolder = "front/src/pack/";
    const backFolder = "pack/";

    for (let [name, item] of Object.entries(allEntries)) {
        if (item.type === "dir") {
            console.log(`Loading ${name}...`);
            await loadProject(item.contents, frontFolder, backFolder, item, zip);
        }

        if (name === "app.json") {
            let data = item.entry.getData().toString("utf-8");
            writeFile(frontFolder + "_app.json", data);
            writeFile(backFolder + "_app.json", data);
            copyFile("./appTemplate.js", frontFolder + "index.js");
            copyFile("./appTemplate.js", backFolder + "index.js");
        }
    }

    return require('./pack').default;
}

async function loadProject(projectData, frontFolder, backFolder, item, zip) {
    let data = JSON.parse(projectData["project.json"].entry.getData().toString("utf-8"));
    let name = data.name;
    
    let frontData = { functions: {}, remoteFunctions: [], name };
    let backData = { functions: {}, remoteFunctions: [], name };

    for (let fDef of Object.values(data.functions))
        await loadFunction(fDef, frontData, backData);

    for (let [folder, data, node_modules] of [[frontFolder, frontData, "front_node_modules"], [backFolder, backData, "back_node_modules"]]) {
        let folderPath = folder + name + "/";
        await mkdir(folderPath, { recursive: true });
        await writeFile(folderPath + "_project.json", JSON.stringify(data, null, 2));

        for (let fDef of Object.values(data.functions)) {
            if (fDef.type === "code")
                await writeFile(folderPath + fDef.name + ".js", fDef.content);
        }

        if (node_modules in item.contents)
            await extract(item.contents[node_modules], folderPath + "node_modules/");
    }
}

async function loadFunction(def, frontData, backData) {
    if (def.sides.includes("F")) {
        frontData.functions[def.name] = def;
    }

    if (def.sides.includes("B")) {
        backData.functions[def.name] = def;
        frontData.remoteFunctions.push(def.name);
    }
}

/*function progressBar(prog) {
    const width = 40;
    const fill = (prog * width / 100) | 0;
    const bar = "\u2588".repeat(fill) + "_".repeat(width - fill);

    process.stdout.write(`\r[${bar}] ${prog}%`);
}*/

function pullAllEntries(zip, filter) {
    let all = { type: "dir", contents: {}};
    
    for (let entry of zip.getEntries()) {
        if (entry.isDirectory || (filter && !filter(entry)))
            continue;
        
        if (entry.entryName.indexOf("node_modues") !== -1)
            continue;

        let folders = entry.entryName.split("/");
        let name = folders.pop();

        let currDir = all;
        for (let part of folders) {
            if (!(part in currDir.contents))
                currDir.contents[part] = { type: "dir", contents: {}, entry };
            
            currDir = currDir.contents[part];
        }

        currDir.contents[name] = { type: "file", entry };
    }; 

    return all;
}

async function extract(dir, target) {
    let promises = [];

    for (let [name, data] of Object.entries(dir.contents)) {  
        let promise;

        if (data.type === "dir") {
            let folderPath = target + name + "/";
            promise = mkdir(folderPath, { recursive: true }).then(
                () => extract(data, folderPath));
        }
        else {
            let filePath = target + name;
            let entry = data.entry;
            promise = writeFile(filePath, entry.getData()).then(
                () => utimes(filePath, entry.header.time, entry.header.time));
        }
        
        promises.push(promise);
    };

    await Promise.all(promises);
}

module.exports = loadObn;
