import React, { useEffect, useState } from 'react';
import Tree from '../../Tree';
import './Project.css';
import { useSelector, useDispatch } from 'react-redux';
import UI from '../../../UI';
import graphs, { useGraphKey } from '../../../logic/graphs';
import projects from '../../../logic/projects';
const { shell } = window.require('electron').remote;

function Project() {
    let dispatch = useDispatch();

    let project = useSelector(state => state.project);
    let path = project.path;
    let [packs, setPacks] = useState([]);
    let graphId = useGraphKey();

    let tree = {
        contents: [],
        label: project.name
    }

    for (let [key, graph] of Object.entries(project.graphs)) {
        tree.contents.push({
            label: graph.present.meta.name,
            onClick: event => {
                if (event.button === 0)
                    graphs.openGraph(key, dispatch);

                if (event.button === 2) {
                    let location = { type: "local", graphId: key };
                    graphs.importGraph(location, project, packs, dispatch, graphId);
                }
            }
        });
    }

    let packTree = {
        contents: [],
        label: "Pack"
    }

    for (let [label, project] of Object.entries(packs)) {
        let projectTree = {
            contents: [],
            label
        };

        for (let {name, key} of project) {
            projectTree.contents.push({
                label: name,
                onClick: event => {
                    if (event.button === 2) {
                        let location = { type: "package", pack: label, graphId: key };
                        graphs.importGraph(location, project, packs, dispatch, graphId);
                    }
                }
            })
        }

        packTree.contents.push(projectTree);
    }

    tree.contents.push(packTree)

    useEffect(() => {
        async function loadPacks() {
            let packs = await projects.getPackages(path);
            let simplePacks = {};
            for (let [name, pack] of Object.entries(packs)) {
                simplePacks[name] = [];
                for (let [key, data] of Object.entries(pack.graphs)) {
                    simplePacks[name].push({name: data.present.meta.name, key});
                }
            }
            console.log(simplePacks)
            setPacks(simplePacks);
        }
        loadPacks();
    }, [path]);

    function openInFolder() {
        shell.showItemInFolder(project.path);
    }

    return (
        <div className="Project">
            <UI.Button onClick={openInFolder}>OPEN IN FOLDER</UI.Button>
            <Tree root={tree}/>
        </div>
    )
}

export default Project;