import React, { useState } from 'react';
import Monaco from '../../Panels/Monaco';
import './EditNode.css';
import { useGraphDispatch, useNodeSelector } from '../../logic/scope';
import Modal from '../../UI/Modal';

function EditNode(props) {
    let dispatch = useGraphDispatch();
    let nodeId = props.node;
    let node = useNodeSelector(nodeId);
    let defaultContent = node ? node.content : "";
    let [content, setContent] = useState("");

    if (!node)
        return null;

    function save() {
        dispatch({ type: "SET_CONTENT", nodeId, content });
        props.close();
    }

    return (
        <Modal open={node} header={"edit " + node}>
            <div className="EditNode">
                <div className="edit-node-header">
                    <h1>{node.name}</h1>
                    <button onClick={props.close}>X</button>
                    <button onClick={save}>SAVE</button>
                </div>
                <Monaco defaultValue={defaultContent} mode="edit" onChange={setContent} k={props.id + "_EDIT"} />
            </div>
        </Modal>
    );
}

export default EditNode;