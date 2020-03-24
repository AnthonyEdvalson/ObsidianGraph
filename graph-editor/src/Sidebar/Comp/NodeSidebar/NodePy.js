import React from 'react';
import UI from '../../../UI';


function Node(props) {
    return (
        <UI.Foldout label="Python Properties">
            <UI.TextInput k="module" />
            <UI.PortsEditor k="inputs" nodeKey={props.nodeKey}  typeOptions={["py", "data"]} />
        </UI.Foldout>
    );
}


export default Node;
