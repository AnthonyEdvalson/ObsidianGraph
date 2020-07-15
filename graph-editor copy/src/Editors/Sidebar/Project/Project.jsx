import React, { useState, useEffect } from 'react';
import Tree from '../../Tree';
import './Project.css';
import { useSelector, useDispatch } from 'react-redux';

const util = window.require('util');
const fs = window.require('fs');
const path = window.require('path');


async function openGraph(filePath, dispatch) {
    let data = JSON.parse(await util.promisify(fs.readFile)(filePath, "utf-8"));
    dispatch({ type: "LOAD_GRAPH", data, filePath });
}

async function importGraph(filePath, dispatch) {
    fs.readFile(filePath, (err, data) => {
        if (err) throw err;
        dispatch({type: "NEW_NODE", nodeType: "graph", data: JSON.parse(data), path: filePath});
    });
}


async function traverseProject(currPath, dispatch) {
    let name = path.basename(currPath);

    let stat = await util.promisify(fs.stat)(currPath);

    if (stat.isDirectory() && name !== "node_modules") {
        let entries = await util.promisify(fs.readdir)(currPath);
        let dir = { contents: [], label: name, path: currPath };

        for (let entry of entries) {
            let filePath = path.join(currPath, entry);
            if (filePath.endsWith(".obg"))
                return { label: name, onClick: event => {
                    if (event.button === 0)
                        openGraph(filePath, dispatch);
                    if (event.button === 2)
                        importGraph(filePath, dispatch);
                }};

            let result = await traverseProject(filePath, dispatch);
            if (result)
                dir.contents.push(result);
        }

        dir.contents.sort((a, b) => (
            a.name < b.name || (a.type === "dir" && b.type === "file")) ? -1 : 
          ((a.name > b.name || (a.type === "file" && b.type === "dir")) ?  1 : 0));

        return dir;
    }

    return null;
}


function Project() {
    let [tree, setTree] = useState(null);
    let dispatch = useDispatch();
    let projPath = useSelector(state => state.project.path);

    useEffect(() => {
        async function fetchTree() {
            let root = await traverseProject(projPath, dispatch);
            setTree(root);
        }
        fetchTree();
    }, [projPath, dispatch]);

    return (
        <div className="Project">
            <Tree root={tree}/>
        </div>
    )
}

export default Project;