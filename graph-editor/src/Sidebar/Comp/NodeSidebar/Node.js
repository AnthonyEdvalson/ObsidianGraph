import React from 'react';
import NodeJs from './NodeJs';
import NodePy from './NodePy';
import NodeData from './NodeData';
import NodeIn from './NodeIn';
import NodeOut from './NodeOut';
import NodeGraph from './NodeGraph';
import NodeEdit from './NodeEdit';
import UI from '../../../UI';
import Form from '../../../Form';
import { useDispatch } from 'react-redux';


function Node(props) {
    let bodies = {
        py: NodePy,
        js: NodeJs,
        data: NodeData,
        in: NodeIn,
        out: NodeOut,
        graph: NodeGraph,
        edit: NodeEdit
    }

    let body = props.data.type in bodies ? bodies[props.data.type] : null;
    let data = props.data;
    let dispatch = useDispatch();

    function onChange(change) {
        dispatch({type: "CHANGE_SELECTION", change});
    }

    function handleDelete() {
        dispatch({type: "DELETE_SELECTION"});
    }

    return (
        <Form.Form data={data} onChange={onChange}>
            <UI.Foldout label="Node Properties">
                <UI.TextInput k="name" />
                <UI.Button onClick={handleDelete}>DELETE</UI.Button>
                {/*<UI.Dropdown k="type" options={["data", "py", "js", "graph", "in", "out", "edit"]}/>*/}
            </UI.Foldout>
            {body != null && body({nodeKey: props.nodeKey})}
        </Form.Form>
    );
}

export default Node;
