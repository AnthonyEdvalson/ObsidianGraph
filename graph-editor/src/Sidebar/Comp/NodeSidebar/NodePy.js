import React from 'react';
import UI from '../../../UI';


function Node() {
    return (
        <UI.Foldout label="Python Properties">
            <UI.TextInput k="module" />
            <UI.PortsEditor k="inputs" typeOptions={["py", "data"]} />
        </UI.Foldout>
    );
}


export default Node;
