import React from 'react';
import List from '../Inputs/List';
import PortEditor from '../PortEditor';
import './PortsEditor.css';
import { useDispatch } from 'react-redux';
import { useForm } from '../../Form';

function PortsEditor(props) {
    let dispatch = useDispatch();
    
    return (
        <List k={props.k} handleAdd={e => {dispatch({type: "ADD_PORT", node: props.nodeKey})}}>
            <PortEditor typeOptions={props.typeOptions} />
        </List>
    );
}

export default PortsEditor;