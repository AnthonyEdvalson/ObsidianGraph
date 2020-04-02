import React, {useState} from 'react';
import UI from '../../UI';
import Form from '../../Form';
import { useDispatch, useSelector } from 'react-redux';


function NewGraph(props) {
    let dispatch = useDispatch();
    let open = useSelector(state => state.modals.newGraph);
    
    const [state, setState] = useState({
        directory: "C:\\Users\\tonye\\Documents\\Obsidian Projects",
        name: "New project",
        author: "",
        description: "",
        template: "Empty"
    });

    function handleCreate() {
        dispatch({type: "NEW_GRAPH", ...state});
        handleCancel();
    }

    function handleCancel() {
        dispatch({type: "SET_MODAL_OPEN", name: "newGraph", open: false});
    }

    return (
        <UI.Modal open={open} header="New Graph">
            <div className="NewGraph" style={{overflow: "auto"}}>
                <Form.Form data={state} onChange={setState}>
                    <UI.PathInput k="directory" dialogOptions={{openDirectory: true, openFile: false}} />
                    <UI.TextInput k="name" />
                    <UI.TextInput k="author" />
                    <UI.TextArea k="description" />
                    <UI.Dropdown k="template" options={["Empty", "Web App", "Backend", "Frontend"]} />
                    <UI.Button onClick={handleCreate}>Create</UI.Button>
                    <UI.Button onClick={handleCancel}>Cancel</UI.Button>
                </Form.Form>
            </div>
        </UI.Modal>
    );
}

export default NewGraph;