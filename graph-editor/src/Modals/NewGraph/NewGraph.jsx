import React, {useState} from 'react';
import UI from '../../UI';
import Form from '../../Form';
import graphs from '../../logic/graphs';
import { useProjectDispatch } from '../../logic/scope';


function NewGraph(props) {
    let dispatch = useProjectDispatch();
    let open = props.open;//useSelector(state => state.modals.newGraph);
    
    const [state, setState] = useState({
        name: "New Graph",
        template: "Empty"
    });

    function handleCreate() {
        graphs.newGraph(dispatch, state.name);
        props.handleClose();
    }

    return (
        <UI.Modal open={open} header="New Graph">
            <div className="NewGraph" style={{overflow: "auto"}}>
                <Form.Form data={state} onChange={setState}>
                    <UI.TextInput k="name" />
                    <UI.Button onClick={handleCreate}>Create</UI.Button>
                    <UI.Button onClick={props.handleClose}>Cancel</UI.Button>
                </Form.Form>
            </div>
        </UI.Modal>
    );
}

export default NewGraph;