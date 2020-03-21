import React from 'react';
import TextInput from '../Inputs/TextInput';
import './PortEditor.css';
import Obj from '../Inputs/Obj';
import Dropdown from '../Inputs/Dropdown';

function PortEditor(props) {
    return (
        <Obj k={props.k} label={props.label}>
            <TextInput k="label" />
            <Dropdown k="type" options={props.typeOptions} />
        </Obj>
    );
}

export default PortEditor;