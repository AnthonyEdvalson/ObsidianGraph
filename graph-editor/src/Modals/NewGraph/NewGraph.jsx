import React, {useState, useEffect} from 'react';
import UI from '../../UI';
import Form from '../../Form';
import { useDispatch, useSelector } from 'react-redux';


function NewGraph() {
    let dispatch = useDispatch();
    let open = useSelector(state => state.modals.newGraph);
    let projDir = useSelector(state => state.project && state.project.path);
    
    const [state, setState] = useState();

    useEffect(() => {
        setState(() => ({
            directory: projDir,
            name: "New Graph",
            template: "Empty"
        }));
    }, [projDir]);

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
                    {/*<UI.Dropdown k="template" options={["Empty", "Web App", "Backend", "Frontend"]} />*/}
                    <UI.Button onClick={handleCreate}>Create</UI.Button>
                    <UI.Button onClick={handleCancel}>Cancel</UI.Button>
                </Form.Form>
            </div>
        </UI.Modal>
    );
}

export default NewGraph;