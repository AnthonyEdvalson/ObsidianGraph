import React, {useState, useEffect} from 'react';
import UI from '../../UI';
import { useDispatch } from 'react-redux';
import './OpenProject.css';
import projects from '../../logic/projects';
const { dialog } = window.require("electron").remote;

function OpenProject({ open, defaultDirectory, handleClose }) {
    let dispatch = useDispatch();
    let [recents, setRecents] = useState([]);
    const recentPath = "./recents.json";

    useEffect(() => {
        projects.readRecents(recentPath).then(setRecents);
    }, [setRecents]);

    function handleOpen(file) {
        projects.openProject(file, dispatch).then(async () => {
            setRecents(await projects.addRecent(file, recents, recentPath));
        });

        handleClose();
    }

    function handleOpenFile() {
        dialog.showOpenDialog({
            defaultPath: defaultDirectory,
            filters: [{name: "Obsidian Project File", extensions: ["obp"]}],
            properties: ["openFile"]
        }).then(result => {
            if (result.canceled || !result.filePaths)
                return;

            handleOpen(result.filePaths[0]);
        });
    }

    function handleNew() {
        handleClose();
        projects.showNewProject(dispatch);
    }
 
    return (
        <UI.Modal open={open} header="Open Project">
            <div className="OpenProject" style={{overflow: "auto"}}>
                <div className="recents">
                    {recents.map(recent => <RecentEntry key={recent.path} {...recent} handleOpen={handleOpen} />)}
                </div>
                <UI.Button onClick={handleOpenFile}>Open Project From File</UI.Button>
                <UI.Button onClick={handleNew}>Create New Project</UI.Button>
                <UI.Button onClick={() => projects.hideOpenProject(dispatch)}>Cancel</UI.Button>
            </div>
        </UI.Modal>
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


