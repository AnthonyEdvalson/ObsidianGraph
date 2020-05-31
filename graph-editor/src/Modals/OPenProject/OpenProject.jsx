import React, {useState, useEffect} from 'react';
import UI from '../../UI';
import { useDispatch, useSelector } from 'react-redux';
import './OpenProject.css';
import projects from '../../logic/projects';
const { dialog } = window.require("electron").remote;

function OpenProject() {
    let dispatch = useDispatch();
    let open = useSelector(state => state.modals.openProject);
    let libdir = useSelector(state => state.library.path);
    let [recents, setRecents] = useState([]);
    const recentPath = "./recents.json";

    useEffect(() => {
        projects.readRecents(recentPath).then(setRecents);
    }, [setRecents]);

    function handleOpen(file) {
        projects.openProject(file, dispatch, recents, recentPath).then(newRecents => {
            setRecents(newRecents);
        });
        projects.hideOpenProject(dispatch);
    }

    function handleOpenFile() {
        dialog.showOpenDialog({
            defaultPath: libdir,
            filters: [{name: "Obsidian Project File", extensions: ["obp"]}],
            properties: ["openFile"]
        }).then(result => {
            if (result.canceled || !result.filePaths)
                return;

            handleOpen(result.filePaths[0]);
        });
    }

    function handleNew() {
        projects.hideOpenProject(dispatch);
        projects.showNewProject(dispatch);
    }
 
    return (
        <UI.Modal open={open} header="Open Project">
            <div className="OpenProject" style={{overflow: "auto"}}>
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
                <UI.Button onClick={handleOpenFile}>Open Project From File</UI.Button>
                <UI.Button onClick={handleNew}>Create New Project</UI.Button>
                <UI.Button onClick={() => projects.hideOpenProject(dispatch)}>Cancel</UI.Button>
            </div>
        </UI.Modal>
    );
}

export default OpenProject;