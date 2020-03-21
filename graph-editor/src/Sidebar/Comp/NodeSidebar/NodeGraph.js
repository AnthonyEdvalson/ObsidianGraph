import React from 'react';
import UI from '../../../UI';


function Node() {
    return (
        <UI.Foldout label="Graph Properties">
            <UI.TextInput k="path" />
        </UI.Foldout>
    );
}


export default Node;
