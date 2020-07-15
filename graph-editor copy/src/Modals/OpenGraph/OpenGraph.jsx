/*import React, {useState, useEffect} from 'react';
import UI from '../../UI';
import { useDispatch, useSelector } from 'react-redux';
import './OpenGraph.css';
import graphs from '../../logic/graphs';
const fs = window.require("fs");
const { dialog } = window.require("electron").remote;*/


function OpenGraph() {
    return null;
    /*
    let dispatch = useDispatch();
    let open = useSelector(state => state.modals.openGraph);
    let libdir = useSelector(state => state.library.path);

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
            graphs.openGraph(result.filePaths[0]);
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
                            <div key={recent.path} onClick={() => graphs.openGraph(recent.path, dispatch)}>
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
    );*/
}

export default OpenGraph;