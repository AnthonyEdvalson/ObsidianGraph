import React from 'react';
import Foldout from '../../../UI/Foldout';
import UI from '../../../UI';


function Node() {
    return (
        <Foldout label="Data Properties">
            <UI.TextInput k="content" />
        </Foldout>
    );
}


export default Node;
