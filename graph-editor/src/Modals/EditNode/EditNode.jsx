import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Monaco from '../../Editors/Monaco';
import './EditNode.css';
import { useGraphSelector } from '../../logic/graphs';
import nodes from '../../logic/nodes';

function EditNode() {
    let args = useSelector(state => state.modals.editNode);
    let graphKey = args.graphKey; // TODO Rename graphKey to graphId
    let dispatch = useDispatch();
    let node = useGraphSelector(graph => graph.nodes[args.id], graphKey);
    let defaultContent = node ? node.content : "";
    let [content, setContent] = useState("");

    if (!node)
        return null;

    function close() {
        nodes.closeEditNode(dispatch);
    }

    function save() {
        dispatch({ type: "SET_CONTENT", graphId: graphKey, nodeId: args.id, content });
        close();
    }

    return (
        <div className="EditNode">
            <div className="edit-node-header">
                <h1>{node.name}</h1>
                <button onClick={close}>X</button>
                <button onClick={save}>SAVE</button>
            </div>
            <Monaco defaultValue={defaultContent} mode="edit" onChange={setContent} k={args.id + "_EDIT"} />
        </div>
    );
}

export default EditNode;