import React from 'react';
import List from '../Inputs/List';
import PortEditor from '../PortEditor';
import './PortsEditor.css';

function PortsEditor(props) {
    let defaultPort = {label: "Input", key: Math.random(), type: "data"};

    return (
        <List k={props.k} defaultFactory={() => (defaultPort)}>
            <PortEditor typeOptions={props.typeOptions} />
        </List>
    );
}

export default PortsEditor;