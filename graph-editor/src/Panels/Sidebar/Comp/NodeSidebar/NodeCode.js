import React from 'react';
import UI from '../../../../UI';


function Node(props) {
    return (
        <UI.Foldout label="Code Properties">
            <UI.PortsEditor k="inputs" nodeKey={props.nodeKey} typeOptions={["back", "data"]} />
        </UI.Foldout>
    );
}


export default Node;
