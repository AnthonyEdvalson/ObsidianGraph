import React, {useState, useEffect} from 'react';
import UI from '../../UI';
import Form from '../../Form';
import { useDispatch, useSelector } from 'react-redux';
import graphs from '../../logic/graphs';


function NewGraph() {
    let dispatch = useDispatch();
    let open = useSelector(state => state.modals.newGraph);
    let projDir = useSelector(state => state.project && state.project.path);
    
    const [state, setState] = useState({
        directory: projDir,
        name: "New Graph",
        template: "Empty"
    });

    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            directory: projDir
        }));
    }, [projDir]);

    function handleCreate() {
        graphs.newGraph(dispatch, state.name);
        graphs.hideNewGraph(dispatch);
    }

    return (
        <UI.Modal open={open} header="New Graph">
            <div className="NewGraph" style={{overflow: "auto"}}>
                <Form.Form data={state} onChange={setState}>
                    <UI.PathInput k="directory" dialogOptions={{openDirectory: true, openFile: false}} />
                    <UI.TextInput k="name" />
                    <UI.Button onClick={handleCreate}>Create</UI.Button>
                    <UI.Button onClick={() => graphs.handleCancel(dispatch)}>Cancel</UI.Button>
                </Form.Form>
            </div>
        </UI.Modal>
    );
}

export default NewGraph;