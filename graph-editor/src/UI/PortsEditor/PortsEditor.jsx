import React from 'react';
import List from '../Inputs/List';
import PortEditor from '../PortEditor';
import './PortsEditor.css';
import { useDispatch } from 'react-redux';

function PortsEditor(props) {
    let dispatch = useDispatch();
    let node = props.nodeKey;
    let { graphId, typeOptions } = props;
    
    return (
        <List k={props.k} handleAdd={e => {dispatch({type: "ADD_PORT", node, graphId})}}>
            <PortEditor typeOptions={typeOptions} graphId={graphId}/>
        </List>
    );
}

export default PortsEditor;