import React, {useState} from 'react';
import UI from '../../UI';
import Form from '../../Form';
import { useDispatch } from 'react-redux';
import projects from '../../logic/projects';

const initState = {
    directory: "/Users/work/Documents/ObsidianProjects", //useSelector(state => state.library.path);
    name: "New Project",
    author: "",
    description: ""
};

function NewProject(props) {
    let dispatch = useDispatch();
    let open = props.open;// useSelector(state => state.modals.newProject);
    
    const [state, setState] = useState(initState);

    function handleCreate() {
        projects.newProject(dispatch, state.directory, state.name, state.author, state.description);
        props.handleClose();
        setState(initState);
    }

    return (
        <UI.Modal open={open} header="New Project">
            <div className="NewProject" style={{overflow: "auto"}}>
                <Form.Form data={state} onChange={setState} onSubmit={handleCreate}>
                    <UI.PathInput k="directory" dialogOptions={{openDirectory: true, openFile: false}} />
                    <UI.TextInput k="name" autoFocus />
                    <UI.TextInput k="author" />
                    <UI.TextArea k="description" />
                    <UI.Button submit>Create</UI.Button>
                    <UI.Button onClick={props.handleClose}>Cancel</UI.Button>
                </Form.Form>
            </div>
        </UI.Modal>
    );
}

export default NewProject;