import util from 'util';
import fs from 'fs';
import admZip from 'adm-zip';

let mkdir = util.promisify(fs.mkdir);
let writeFile = util.promisify(fs.writeFile);
let utimes = util.promisify(fs.utimes);

function pullAllEntries(path, filter) {
    let zip = new admZip(path);

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

export default {
    pullAllEntries,
    extract
}