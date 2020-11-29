import React from 'react';
import UI from '../../../../../UI';


function Node() {
    return (
        <UI.Foldout label="Input Properties">
            <UI.Dropdown options={["value", "list"]} k="valueType" />
        </UI.Foldout>
    );
}


export default Node;
