import React from 'react';
import NodeFront from './NodeFront';
import NodeBack from './NodeBack';
import NodeData from './NodeData';
import NodeIn from './NodeIn';
import NodeOut from './NodeOut';
import NodeGraph from './NodeGraph';
import NodeEdit from './NodeEdit';
import UI from '../../../../UI';
import Form from '../../../../Form';
import { useDispatch } from 'react-redux';


function Node(props) {
    let bodies = {
        back: NodeBack,
        front: NodeFront,
        data: NodeData,
        in: NodeIn,
        out: NodeOut,
        graph: NodeGraph,
        edit: NodeEdit
    }

    let body = props.data.type in bodies ? bodies[props.data.type] : null;
    let data = props.data;
    let graphId = props.graphId;
    let dispatch = useDispatch();

    function onChange(change) {
        dispatch({type: "CHANGE_SELECTION", change, graphId});
    }

    function onChangeName(change) {
        let name = change();
        dispatch({type: "SET_NODE_NAME", node: props.nodeKey, name, graphId});
    }

    function handleDelete() {
        dispatch({type: "DELETE_SELECTION", graphId});
    }

    return (
        <Form.Form data={data} onChange={onChange}>
            <UI.Foldout label="Node Properties">
                <Form.Form data={data.name} onChange={onChangeName}>
                    <UI.TextInput updateOn="blur" />
                </Form.Form>
                <UI.Button onClick={handleDelete}>DELETE</UI.Button>
            </UI.Foldout>
            {body !== null && React.createElement(body, {nodeKey: props.nodeKey, graphId})}
        </Form.Form>
    );
}

export default Node;
