import React, {useState, useEffect} from 'react';
import UI from '../../UI';
import { useDispatch, useSelector } from 'react-redux';
import './OpenGraph.css';
const fs = window.require("fs");
const path = window.require("path");
const { dialog } = window.require("electron").remote;


function OpenGraph() {
    let dispatch = useDispatch();
    let open = useSelector(state => state.modals.openGraph);
    let libdir = useSelector(state => state.library.path);
    let [recents, setRecents] = useState([]);
    const recentPath = "./recents.json";

    useEffect(() => {
        fs.readFile(recentPath, "utf-8", (err, data) => {
            if (err) throw err;
            setRecents(JSON.parse(data));
        });
    }, [setRecents]);

    function handleOpen(filePath) {
        fs.readFile(filePath, "utf-8", (err, data) => {
            dispatch({type: "LOAD_GRAPH", data: JSON.parse(data), filePath});
            handleClose();
        });

        let newRecent = {
            name: path.basename(filePath, ".obg"), 
            path: filePath, 
            date: new Date().toLocaleString()
        };

        let newRecents = [newRecent];
        for (let recent of recents) {
            if (recent.path !== newRecent.path && newRecents.length < 5)
                newRecents.push(recent);
        }
        
        fs.writeFile(recentPath, JSON.stringify(newRecents), err => {
            if (err) throw err;
        });

        setTimeout(() => {
            setRecents(newRecents);
        }, 400);
    }

    function handleClose() {
        dispatch({type: "SET_MODAL_OPEN", name: "openGraph", open: false});
    }

    function handleOpenFile() {
        dialog.showOpenDialog({
            defaultPath: libdir,
            filters: [{name: "Obsidian Graph File", extensions: ["obg"]}],
            properties: ["openFile"]
        }).then(result => {
            if (result.canceled || !result.filePaths)
                return;
            handleOpen(result.filePaths[0]);
        });
    }

    function handleNew() {
        handleClose();
        dispatch({type: "SET_MODAL_OPEN", name: "newGraph", open: true});
    }
 
    return (
        <UI.Modal open={open} header="Open Graph">
            <div className="OpenGraph" style={{overflow: "auto"}}>
                <div className="recents">
                    {
                        recents.map(recent => (
                            <div key={recent.path} onClick={() => handleOpen(recent.path)}>
                                <h1>{recent.name}</h1>
                                <span>{recent.path}</span>
                                <small>{recent.date}</small>
                            </div>
                        ))
                    }
                </div>
                <UI.Button onClick={handleOpenFile}>Open Graph From File</UI.Button>
                <UI.Button onClick={handleNew}>Create New Graph</UI.Button>
                <UI.Button onClick={handleClose}>Cancel</UI.Button>
            </div>
        </UI.Modal>
    );
}

export default OpenGraph;