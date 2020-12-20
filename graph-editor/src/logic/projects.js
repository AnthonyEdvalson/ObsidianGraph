import graphs from "./graphs";
import { toast } from "react-toastify";
import buildProject from "./compileProject";
import version from '../logic/version';
import dedent from 'dedent';
import { existsSync } from "fs";

const obsidian = window.require("obsidian")
const oPackFS = obsidian.oPackFS;
const obsidianUtil = obsidian.util;
const ncp = window.require("ncp").ncp;
const fs = window.require("fs");
const fsp = fs.promises;
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
        recents = await fsp.readFile(recentPath, "utf-8");
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
        await fsp.writeFile(recentPath, JSON.stringify(newRecents));
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
        projectId: obsidianUtil.uuid4()
    };

    await save(data);
    await openProject(folderPath, dispatch);
}

function serializeOPack(oPack) {
    let { opath, ...project } = oPack;

    let newGraphs = {};
    for (let [id, graph] of Object.entries(project.graphs))
        newGraphs[id] = graphs.packForSerialization(graph);

    let oPackData = {
        ...project,
        graphs: newGraphs
    };

    return JSON.stringify(oPackData, null, 2);
}

async function openProject(projectPath, dispatch) {
    let data = null;

    try {
        let data = unpackFromSerialization(await oPackFS.loadOPackDef(path.join(projectPath, "opack")), projectPath);
        //let oPackPath = path.join(projectPath, "opack/opack.json");
        //let oPack = await fs.readFile(oPackPath, "utf-8");
        //data = await deserializeOPack(oPack, oPackPath);
        console.log(data);
        dispatch({type: "LOAD_PROJECT", data});
        dispatch({type: "SET_FOCUS", focus: { projectId: data.projectId, rootProjectId: data.projectId } });
    } catch (e) {
        toastErr("Unable to open that project", e);
        return;
    }

    //let packs = await getPackages(data.path);
    //for (let data of Object.values(packs)) {
    //    dispatch({type: "LOAD_PROJECT", data});
    //}
}

/*


function getId(name) {

}

function transformPort(ref, label, def, nodeId) {
    if (Array.isArray(ref))
        throw new Error("LIST PORTS NOT IMPLEMENTED");

    let portId = obsidianUtil.uuid4();
}

function transformDef(def) {
    let { ...oPackInfo, graphs } = def;
    let data = { 
        ...oPackInfo,
        graphs: {}
    };

    for (let [graphName, graph] of Object.entries(graphs)) {
        let { ...meta, nodes } = graph;
        let dataGraph = { 
            meta: {
                ...meta,
                name: graphName
            },
            nodes: {},
            ports: {},
            pins: {},
            links: {}
        };
        let graphId = obsidianUtil.uuid4();

        for (let [nodeName, node] of Object.entries(nodes)) {
            let dataNode = {
                ...node,
                name: nodeName,
                inputs: [],
                output: null
            };
            let nodeId = obsidianUtil.uuid4();

            if (node.output) {
                dataNode.output = transformPort(node.output, def, nodeId)
            }

            for (let [label, inputNodeName] of Object.entries(node.inputs)) {

            }


            dataGraph.nodes[nodeId] = dataNode;
        }
        data.graphs[graphId] = dataGraph;
    }
}
*/

async function deserializeOPack(oPack, oPackPath, ingoreOutdated) {
    let appData = JSON.parse(oPack);

    if (version.outdated(appData.v)) {
        if (ingoreOutdated)
            return null;

        // example/project.json -> example/project_v1_0_2.obn.bak
        let backupPath = oPackPath.replace(/\.[^/.]+$/, "") + "_v" + appData.v.toString().replace(".", "_") + ".bak.json";
        await backup(oPackPath, backupPath);
        toastWarn(path.basename(oPackPath) + " is outdated, a backup has been made at " + path.basename(backupPath));

        appData = version.upgrade(appData);
    }

    let project = { path: path.dirname(oPackPath), ...appData };

    let newGraphs = {};
    console.log(appData)
    for (let [id, graph] of Object.entries(appData.graphs))
        newGraphs[id] = graphs.unpackFromSerialization(graph, id);

    // Save before return???
    return {
        ...project,
        graphs: newGraphs
    };
}


async function save(project) {
    let projectPath = project.path;

    if (!fs.existsSync(projectPath))
        await makeDefault(project.name, projectPath);
    /*
    let folders = ["", "opack/", "front/", "back/"]
    for (let folder of folders) {
        let folderPath = path.join(projectPath, folder);

        if (!fs.existsSync(folderPath)) {
            try {
                await fsp.mkdir(folderPath, { recursive: true });

                let index = { "front/": FRONT_INDEX, "back/": BACK_INDEX, "": ROOT_INDEX }[folder];
                if (index) {
                    let srcPath = folderPath;

                    if (folder !== "") {
                        srcPath = path.join(srcPath, "src");
                        await fsp.mkdir(srcPath);
                    }

                    let indexPath = path.join(srcPath, "index.js");
                    await fsp.writeFile(indexPath, index, "utf-8");
                }

                let pack = { "front/": FRONT_PACKAGE, "back/": BACK_PACKAGE, "": ROOT_PACKAGE }[folder];
                if (pack) {
                    await fsp.writeFile(path.join(folderPath, "package.json"), pack(project.name), "utf-8");
                }

                if (folder === "") {
                    await fsp.writeFile(path.join(folderPath, ".gitignore"), ROOT_GITIGNORE, "utf-8");
                    await fsp.writeFile(path.join(folderPath, "nodemon.json"), ROOT_NODEMON, "utf-8");
                }

                if (folder === "back/")
                    await fsp.writeFile(path.join(folderPath, ".babelrc"), BACK_BABELRC, "utf-8");

            } catch (e) {
                toastErr("Unable to create folder " + folderPath, e);
                console.error(e);
                return;
            }
        }
    }
    */
    await oPackFS.saveOPackDef(packForSerialization(project), path.join(projectPath, "opack"));
    toast("Saved " + project.name + ".json", {type: "success"});
}

async function makeDefault(name, currentPath, structure=DEFAULT_PROJECT) {
    if (typeof(structure) === "function")
        structure = structure(name);

    if (typeof(structure) === "object") {
        await fsp.mkdir(currentPath, { recursive: true });
        await Promise.all(Object.entries(structure).map(
            async ([subName, subStruct]) => makeDefault(name, path.join(currentPath, subName), subStruct)
        ));
    }
    else if (typeof(structure) === "string") {
        await fsp.writeFile(currentPath, structure, "utf-8");
    }
}

async function backup(src, dest) {
    throw new Error("NOT IMPLEMENTED");
    if (src && fs.existsSync(src))
        await fsp.copyFile(src, dest, fs.constants.COPYFILE_FICLONE);
}
        

async function importPackage(appPath, targetProjectPath) {
    throw new Error("NOT IMPLEMENTED");
    let sourceProject = path.dirname(appPath);
    let importingName = path.basename(appPath, ".json");
    let targetDirectory = path.join(targetProjectPath, "pack")
    let targetProject = path.join(targetDirectory, importingName);
    
    try {
        if (!fs.existsSync(targetDirectory))
            await fsp.mkdir(targetDirectory);

        if (!fs.existsSync(targetProject))
            await fsp.mkdir(targetProject);

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
    throw new Error("NOT IMPLEMENTED");
    let packFolder = path.join(projectPath, "pack");
    let packNames = await fsp.readdir(packFolder);

    let packs = {}
    for (let packName of packNames) {
        if (packName[0] === ".")
            continue;

        let appPath = path.join(packFolder, packName, packName + ".json");
        let app = await fsp.readFile(appPath, "utf-8");
        let data = await deserializeOPack(app, appPath);

        packs[packName] = data;
    }
    return packs;
}

function build(loadedProjects, projectId) {
    throw new Error("NOT IMPLEMENTED");
    return buildProject(loadedProjects, projectId);
}

function unpackFromSerialization(project, projectPath) {
    return {
        ...project,
        path: projectPath,
        graphs: obsidianUtil.transform(project.graphs, graphs.unpackFromSerialization)
    }
}

function packForSerialization(project) {
    let newProject = {
        ...project,
        graphs: obsidianUtil.transform(project.graphs, graphs.packForSerialization)
    };
    delete newProject.path;
    return newProject;
}

let packName = (name) => name.toLowerCase().replaceAll(/[^a-z]/g, "-");

const DEFAULT_PROJECT = {
    front: {
        "package.json": (name) => dedent`{
                "name": "${packName(name)}-front",
                "version": "0.1.0",
                "dependencies": {
                    "react": "^17.0.1",
                    "react-dom": "^17.0.1",
                    "react-scripts": "4.0.1",
                    "web-vitals": "^0.2.4"
                },
                "scripts": {
                    "start": "react-scripts start",
                    "build": "react-scripts build",
                    "eject": "react-scripts eject"
                },
                "eslintConfig": {
                    "extends": [
                        "react-app"
                    ]
                },
                "browserslist": {
                    "production": [
                        ">0.2%",
                        "not dead",
                        "not op_mini all"
                    ],
                    "development": [
                        "last 1 chrome version",
                        "last 1 firefox version",
                        "last 1 safari version"
                    ]
                }
            }
            `,
        src: {
            "index.js": dedent`import React, { useMemo } from 'react';
                import ReactDOM from 'react-dom';
                import oPack from './generated/opackx';
                
                
                let highPrecisionTime = () => performance.timeOrigin + performance.now();
                oPack.setEditorProfiler(highPrecisionTime, () => {});
                
                function EngineUI() {
                    let res = oPack.evalRoot();
                
                    if (res === undefined)
                        throw new Error("The ouptut of the graph 'Main' is undefined")
                
                    if (!React.isValidElement(res))
                        return <p>{JSON.stringify(res, null, 2)}</p>
                    
                    return React.cloneElement(res, {});
                }
                
                ReactDOM.render(
                    <React.StrictMode>
                        <EngineUI />
                    </React.StrictMode>,
                    document.getElementById('root')
                );
                
                
                const reportWebVitals = onPerfEntry => {
                    if (onPerfEntry && onPerfEntry instanceof Function) {
                        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                            getCLS(onPerfEntry);
                            getFID(onPerfEntry);
                            getFCP(onPerfEntry);
                            getLCP(onPerfEntry);
                            getTTFB(onPerfEntry);
                        });
                    }
                };
                
                reportWebVitals(console.log);
                `,
        },
        public: {
            "index.thml": dedent`<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <link rel="icon" href="%PUBLIC_URL%/icon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="apple-touch-icon" href="%PUBLIC_URL%/icon.png" />
                <title>React App</title>
              </head>
              <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div id="root"></div>
              </body>
            </html>
            `
        }
    },
    back: {
        "package.json": (name) => dedent`{
                "name": "${packName(name)}-back",
                "version": "0.1.0",
                "main": "src/index.js",
                "scripts": {
                    "start": "babel-node src/index.js"
                },
                "devDependencies": {
                    "@babel/core": "^7.12.9",
                    "@babel/node": "^7.12.6",
                    "@babel/preset-env": "^7.12.7"
                }
            }
            `,
        ".babelrc": dedent`{
                "presets": [
                "@babel/preset-env"
                ],
                "sourceMaps": "both",
                "retainLines": true
            }
            `,
        src: {
            "index.js": dedent`import oPack from './generated/opackx';
                import { performance } from 'perf_hooks';
                
                let highPrecisionTime = () => performance.timeOrigin + performance.now();
                oPack.setEditorProfiler(highPrecisionTime, () => {});
                `
        }
    },
    "index.js": dedent`const { runServer, cli, oPackFS } = require('obsidian');
        const express = require('express');
        const socketIO = require('socket.io');
        const concurrently = require('concurrently');
        
        async function main() {
            let def = await oPackFS.loadOPackDef("./opack");
            await oPackFS.fragmentDef(def, "F", "./front/src/generated");
            await oPackFS.fragmentDef(def, "B", "./back/src/generated");
        
            server = runServer(express, socketIO);
            server.publish();
        
            cli.log("server", "Running backend and frontend...")
            concurrently(
                [
                    {
                        command: "cd ./back && npm start",
                        name: "back",
                        prefixColor: "yellow"
                    },
                    {
                        command: "cd ./front && npm start",
                        name: "front",
                        prefixColor: "red"
                    }
                ], 
                {
                    killOthers: ['failure', 'success']
                }
            );
        }
        
        main();
        `,
    ".gitignore": dedent`# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

        # dependencies
        /node_modules
        /.pnp
        .pnp.js

        # testing
        /coverage

        # production
        /build

        # misc
        .DS_Store
        .env.local
        .env.development.local
        .env.test.local
        .env.production.local
        .eslintcache

        npm-debug.log*
        yarn-debug.log*
        yarn-error.log*
        `,
    "package.json": (name) => dedent`{
            "name": "${packName(name)}",
            "version": "0.0.0",
            "scripts": {
                "start": "nodemon",
                "wipe": "kill -9 $(lsof -t -i:5000)"
            },
            "dependencies": {
                "concurrently": "^5.3.0",
                "express": "^4.17.1",
                "socket.io": "^3.0.3"
            }
        }`,
    "nodemon.json": dedent`{
            "ignore": [
                "**/generated/**",
                "./node_modules",
                "./front/node_modules",
                "./back/node_modules"
            ],
            "ignoreRoot": [
                "**/.git/**",
                "**/.log/**",
                "**/.nyc_output/**",
                "**/.sass-cache/**",
                "**/bower_components/**",
                "**/coverage/**"
            ],
            "watch": [
                "./"
            ],
            "ext": "js,jsx,css,json",
            "env": {
            "NODE_ENV": "development"
            }
        }
        `
}

export default {
    readRecents,
    addRecent,
    openProject,
    newProject,
    save,
    importPackage,
    getPackages,
    build
};
