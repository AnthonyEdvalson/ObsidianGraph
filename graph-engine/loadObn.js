const admZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

function loadObn(obnPath, callback) {
    let zip = new admZip(obnPath);

    let allEntries = pullAllEntries(zip);
    
    console.log("Loading Frontend From " + path.basename(obnPath) + "...");
    extractFolder(allEntries.contents.front, "front/src/pack/", () => {
        console.log("Loading Backend From " + path.basename(obnPath) + "...");
        extractFolder(allEntries.contents.back, "pack/", () => {
            console.log("Obn Loaded\n");
            callback();
        });
    });
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
                currDir.contents[part] = { type: "dir", contents: {}};
            
            currDir = currDir.contents[part];
        }

        currDir.contents[name] = { type: "file", entry };
    }; 

    return all;
}

function extractFolder(dir, target, callback) {
    let completeCount = 0;
    function completed() {
        completeCount--;
        if (completeCount === 0)
            callback();
    }

    for (let [name, data] of Object.entries(dir.contents)) {
        completeCount++;
        
        if (data.type === "dir") {
            let folderPath = target + name + "/"
            fs.mkdir(folderPath, { recursive: true }, err => {
                if (err) throw err;

                extractFolder(data, folderPath, () => {
                    completed();
                });
            });
        }
        else {
            let filePath = target + name;
            let entry = data.entry;
            fs.writeFile(filePath, entry.getData(), err => {
                if (err) throw err;

                fs.utimes(filePath, entry.header.time, entry.header.time, err => {
                    if (err) throw err;
                    completed();
                });
            });
        }
    };
}

module.exports = loadObn;