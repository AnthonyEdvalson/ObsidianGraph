const admZip = require('adm-zip');
const fs = require('fs');

function loadObn(path) {
    let obnZip = new admZip(path);
    //let nodeModules = new admZip(obnZip.getEntry("packages.zip").getData());

    console.log("Loading obn...");
    
    function readZippedFile(name) {
        return JSON.parse(obnZip.getEntry(name).getData().toString());
    }

    function readSubgraph(name, savePath) {
        let dataIn = readZippedFile(name);
        let dataOut = { 
            output: dataIn.output,
            nodes: {}
        };

        let keys = [];

        for (let [k, v] of Object.entries(dataIn.nodes)) {
            dataOut.nodes[k] = { type: v.type };
            let ext;
            if (v.type === "code") {
                dataOut.nodes[k].inputs = v.inputs;
                ext = ".js";
                keys.push([k, k]);
            }
            else {
                ext = ".json";
                keys.push([k, k + ext]);
            }
            
            fs.writeFileSync(savePath + k + ext, v.file, err => {
                if (err) throw err;
            });
        }

        let indexContent = "";

        for (let k of keys) {
            indexContent += `const ${k[0]} = require('./${k[1]}')\n`;
        }
        indexContent += "\nmodule.exports = {\n";
        for (let k of keys) {
            indexContent += `\t${k[0]},\n`;
        }
        indexContent += "};\n";

        fs.writeFileSync(savePath + "_index.js", indexContent, err => {
            if (err) throw err; 
        });

        /*nodeModules.extractAllTo(savePath + "node_modules", err => {
            if (err) throw err;
        });*/

        return dataOut;
    }
  
    let obnData = {
        front: readSubgraph("front.json", "./front/src/pack/"),
        back: readSubgraph("back.json", "./pack/"),
        meta: readZippedFile("meta.json"),
    }

    console.log("Loaded obn data...");
    console.log("Packages loaded");

    return obnData;
}

module.exports = loadObn;