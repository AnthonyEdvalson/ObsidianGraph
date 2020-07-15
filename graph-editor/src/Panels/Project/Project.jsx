import React, { useEffect, useState } from 'react';
import Tree from '../Tree';
import './Project.css';
//import { useSelector, useDispatch } from 'react-redux';
import UI from '../../UI';
import graphs from '../../logic/graphs';
import OpenProject from '../../Modals/OpenProject';
import Panel from '../Panel';
import { useProjectSelector } from '../../logic/scope';
import { useDispatch, useSelector } from 'react-redux';
import projects from '../../logic/projects';
const { shell } = window.require('electron').remote;
const { dialog } = window.require("electron").remote;

function Project({ setMenu }) {
    let project = useProjectSelector();
    let [openProject, setOpenProject] = useState(true);
    let dispatch = useDispatch();
    let tree = useProjectTree(project, dispatch);
    let loadedProjects = useSelector(state => state.projects);

    useEffect(() => {
        const menu = [
            {name: "New", shortcut: "Mod+N", action: projects.newProject },
            {name: "Open", shortcut: "Mod+O", action: projects.openProject },
            null,
            {name: "Save", shortcut: "Mod+S", action: () => { projects.save(project) } },
            //{name: "Save As...", shortcut: "Ctrl+Shift+S", action: "saveAs"},
            {name: "Export", shortcut: "Mod+E", action: () => { 
                projects.save(project);
                exportProject(loadedProjects, project.projectId)
            }},
            {name: "Show In Folder", action: () => { throw new Error("NOT IMPLEMENTED")}},
            {name: "Import Project", shortcut: "Mod+Shift+O", action: () => { throw new Error("NOT IMPLEMENTED")}},
        ];

        setMenu("Project", menu);
    }, [setMenu, project, loadedProjects]);
    
    //let [newProject, setNewProject] = useState(false);
    //let [packs, setPacks] = useState([]);


    function openInFolder() {
        shell.showItemInFolder(project.path);
    }

    return (
        <Panel>
            <div className="Project">
                <UI.Button onClick={openInFolder}>Open in folder</UI.Button>
                <Tree root={tree}/>
            </div>
            <OpenProject open={openProject} handleClose={() => setOpenProject(false)}/>
        </Panel>
    )
}

function useProjectTree(project, dispatch) {
    let importGraph = graphs.useImportGraph();
    let [packs, setPacks] = useState([]);
    let path = project && project.path;
    
    useEffect(() => {
        if (path)
            projects.getPackages(path).then(setPacks)
    }, [path, setPacks]);

    if (!project)
        return;

    let projectId = project.projectId;
    
    let tree = {
        contents: [],
        label: project.name
    }

    for (let [graphId, graph] of Object.entries(project.graphs)) {
        tree.contents.push({
            label: graph.present.meta.name,
            onClick: handleGraphClick(dispatch, importGraph, projectId, graphId)
        });
    }

    let packTree = {
        contents: [],
        label: "Pack"
    }
    
    for (let [label, pack] of Object.entries(packs)) {
        let projectTree = {
            contents: [],
            label
        };

        for (let [graphId, graph] of Object.entries(pack.graphs)) {
            projectTree.contents.push({
                label: graph.present.meta.name,
                onClick: handleGraphClick(dispatch, importGraph, pack.projectId, graphId)
            })
        }

        packTree.contents.push(projectTree);
    }

    tree.contents.push(packTree)


    /*useEffect(() => {
        async function loadPacks() {
            let packs = await projects.getPackages(path);
            let simplePacks = {};
            for (let [name, pack] of Object.entries(packs)) {
                simplePacks[name] = [];
                for (let [key, data] of Object.entries(pack.graphs)) {
                    simplePacks[name].push({name: data.present.meta.name, key});
                }
            }
            setPacks(simplePacks);
        }
        loadPacks();
    }, [path]);*/

    return tree;
}

function handleGraphClick(dispatch, importGraph, projectId, graphId) {
    return (event) => {
        if (event.button === 0)
            graphs.openGraph(dispatch, graphId, projectId);

        if (event.button === 2) {
            importGraph({ projectId, graphId });
        }
    }
}

function exportProject(loadedProjects, projectId) {
    let [zip, name] = projects.build(loadedProjects, projectId);

    dialog.showSaveDialog({
        defaultPath: name + ".obn",
        filters: [{name: "Obsidian Node File", extensions: ["obn"]}]
    }).then(({ filePath }) => {
        if (filePath)
            zip.write(filePath);
    });
}

export default Project;