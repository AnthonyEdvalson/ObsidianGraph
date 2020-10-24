import React, {useState} from 'react';
import UI from '../../UI';
import Form from '../../Form';
import graphs from '../../logic/graphs';
import { useProjectDispatch } from '../../logic/scope';

let initState = {
    name: "",
    template: "Empty"
}

function NewGraph(props) {
    let dispatch = useProjectDispatch();
    let open = props.open;//useSelector(state => state.modals.newGraph);
    
    const [state, setState] = useState(initState);

    function handleCreate() {
        graphs.newGraph(dispatch, state.name);
        props.handleClose();
        setState(initState);
    }

    return (
        <UI.Modal open={open} header="New Graph">
            <div className="NewGraph" style={{overflow: "auto"}}>
                <Form.Form data={state} onChange={setState}>
                    <UI.TextInput k="name" placeholder="New Graph" autoFocus />
                    <UI.Button onClick={handleCreate} submit>Create</UI.Button>
                    <UI.Button onClick={props.handleClose}>Cancel</UI.Button>
                </Form.Form>
            </div>
        </UI.Modal>
    );
}

export default NewGraph;