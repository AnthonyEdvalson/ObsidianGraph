import React from 'react';
import UI from '../../../../UI';
import {useForm} from '../../../../Form';

function Node() {
    let {data} = useForm();
    return (
        <UI.Foldout label="Graph Properties">
            {
                data.meta && (
                    <>
                        <UI.Label>Name: {data.meta.name}</UI.Label>
                        <UI.Label>Description: {data.meta.description}</UI.Label>
                        <UI.Label>Author: {data.meta.author}</UI.Label>
                        <UI.Label>Tags: {data.meta.tags}</UI.Label>
                    </>
                )
            }
            <UI.TextInput k="path" />
            <UI.Schema k="schema" dk="parameters" />
        </UI.Foldout>
    );
}


export default Node;
