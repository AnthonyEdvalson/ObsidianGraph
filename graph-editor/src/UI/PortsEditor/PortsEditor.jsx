import React from 'react';
import List from '../Inputs/List';
import PortEditor from '../PortEditor';
import './PortsEditor.css';
import { useGraphDispatch } from '../../logic/scope';

function PortsEditor(props) {
    let dispatch = useGraphDispatch();
    let node = props.nodeKey;
    let { typeOptions } = props;
    
    return (
        <List k={props.k} handleAdd={e => {dispatch({type: "ADD_PORT", node})}}>
            <PortEditor typeOptions={typeOptions} />
        </List>
    );
}

export default PortsEditor;