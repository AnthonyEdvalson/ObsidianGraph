import React from 'react';
import './LibNode.css';
import { useDispatch } from 'react-redux';
const { getDefaultParams } = require("../../UI/Schema");
const fs = window.require("fs");

function transformImportedGraph(graph, path) {    
    let data = {
        path,
        parameters: null,
        inputs:[], 
        output: null, 
        schema: null,
        name: graph.meta.name
    };

    for (let node of Object.values(graph.nodes)) {
        if (node.type === "in") {
            data.inputs.push(node.output);
        }

        if (node.type === "out") {
            data.output = node.inputs[0];
        }

        if (node.type === "edit") {
            data.schema = JSON.parse(node.schema);
            data.parameters = getDefaultParams(data.schema);
        }
    }
    
    return data;
}

function importNode(path, dispatch) {
    fs.readFile(path, (err, data) => {
        if (err) throw err;

        let graphData = transformImportedGraph(JSON.parse(data), path)
        dispatch({type: "NEW_NODE", nodeType: "graph", data: graphData});
    });
}

function LibNode(props) {
    const {name, obnPath} = props.data;
    const search = props.search;
    const dispatch = useDispatch();

    if (search !== "" && !name.includes(search))
        return null;

    return (
        <div className="LibNode" onClick={() => importNode(obnPath, dispatch)}>
            {name}
        </div>
    );
}

export default LibNode;
