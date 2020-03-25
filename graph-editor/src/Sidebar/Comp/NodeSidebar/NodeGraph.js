import React from 'react';
import UI from '../../../UI';


function Node() {
    return (
        <UI.Foldout label="Graph Properties">
            <UI.TextInput k="path" />
            <UI.Schema k="schema" dk="parameters" />
        </UI.Foldout>
    );
}


export default Node;
