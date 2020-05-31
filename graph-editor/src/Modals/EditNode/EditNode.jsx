import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';
import './EditNode.css';
import { useGraphSelector } from '../../logic/graphs';
import nodes from '../../logic/nodes';

function EditNode() {
    let args = useSelector(state => state.modals.editNode);
    let graphKey = args.graphKey; // TODO Rename graphKey to graphId
    let dispatch = useDispatch();
    let node = useGraphSelector(graph => graph.nodes[args.id], graphKey);
    let [content, setContent] = useState("");

    useEffect(() => {
        if (node)
            setContent(node.content);
    }, [node]);

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
            <MonacoEditor
                language="javascript"
                theme="vs-dark"
                options={{showFoldingControls: true, showUnused: true}}
                value={content}
                onChange={setContent}
            />
        </div>
    );
}

export default EditNode;