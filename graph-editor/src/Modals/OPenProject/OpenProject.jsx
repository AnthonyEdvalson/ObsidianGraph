import React, {useState, useEffect} from 'react';
import UI from '../../UI';
import { useDispatch } from 'react-redux';
import NewProject from '../NewProject';

import './OpenProject.css';
import projects from '../../logic/projects';
const { dialog } = window.require("electron").remote;

function OpenProject({ open, defaultDirectory, handleClose }) {
    let dispatch = useDispatch();
    let [recents, setRecents] = useState([]);
    let [showNewProject, setShowNewProject] = useState(false);
    const recentPath = "./recents.json";

    useEffect(() => {
        projects.readRecents(recentPath).then(setRecents);
    }, [setRecents]);

    function handleOpen(projectPath) {
        projects.openProject(projectPath, dispatch).then(async () => {
            setRecents(await projects.addRecent(projectPath, recents, recentPath));
        });

        handleClose();
    }

    function handleOpenFile() {
        dialog.showOpenDialog({
            title: "Open Obsidian Project",
            defaultPath: defaultDirectory,
            properties: ["openDirectory"]
        }).then(result => {
            if (!result.canceled && result.filePaths)
                handleOpen(result.filePaths[0]);
        });
    }

    function handleNew() {
        setShowNewProject(true);
    }
 
    return (
        <>
            <UI.Modal open={open && !showNewProject} header="Open Project">
                <div className="OpenProject" style={{overflow: "auto"}}>
                    <div className="recents">
                        {recents.map(recent => <RecentEntry key={recent.path} {...recent} handleOpen={handleOpen} />)}
                    </div>
                    <UI.Button onClick={handleOpenFile}>Open Project From File</UI.Button>
                    <UI.Button onClick={handleNew}>Create New Project</UI.Button>
                    <UI.Button onClick={handleClose}>Cancel</UI.Button>
                </div>
            </UI.Modal>
            <NewProject open={open && showNewProject} handleClose={() => setShowNewProject(false)} />
        </>
    );
}

function RecentEntry({ path, name, date, handleOpen }) {
    return (
        <div key={path} onClick={() => handleOpen(path)}>
            <h1>{name}</h1>
            <span>{path}</span>
            <small>{date}</small>
        </div>
    )
}

export default OpenProject;


