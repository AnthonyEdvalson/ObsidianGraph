import React, {useState} from 'react';
import UI from '../../UI';
import Form from '../../Form';
import { useDispatch, useSelector } from 'react-redux';


function NewProject(props) {
    let dispatch = useDispatch();
    let open = useSelector(state => state.modals.newProject);
    let libdir = useSelector(state => state.library.path);
    
    const [state, setState] = useState({
        directory: libdir,
        name: "New Project",
        author: "",
        description: ""
    });

    function handleCreate() {
        dispatch({type: "NEW_PROJECT", ...state});
        handleCancel();
    }

    function handleCancel() {
        dispatch({type: "SET_MODAL_OPEN", name: "newProject", open: false});
    }

    return (
        <UI.Modal open={open} header="New Project">
            <div className="NewProject" style={{overflow: "auto"}}>
                <Form.Form data={state} onChange={setState}>
                    <UI.PathInput k="directory" dialogOptions={{openDirectory: true, openFile: false}} />
                    <UI.TextInput k="name" />
                    <UI.TextInput k="author" />
                    <UI.TextArea k="description" />
                    <UI.Button onClick={handleCreate}>Create</UI.Button>
                    <UI.Button onClick={handleCancel}>Cancel</UI.Button>
                </Form.Form>
            </div>
        </UI.Modal>
    );
}

export default NewProject;