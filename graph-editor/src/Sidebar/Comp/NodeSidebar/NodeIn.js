import React from 'react';
import UI from '../../../UI';


function Node() {
    return (
        <UI.Foldout label="Input Properties">
            <UI.PortEditor k="output" typeOptions={["py", "js", "data"]} />
        </UI.Foldout>
    );
}


export default Node;
