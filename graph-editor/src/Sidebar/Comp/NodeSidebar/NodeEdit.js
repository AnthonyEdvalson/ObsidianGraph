import React from 'react';
import UI from '../../../UI';


function Node() {
    return (
        <UI.Foldout label="Editor Properties">
            <UI.TextArea k="schema" />
        </UI.Foldout>
    );
}


export default Node;
