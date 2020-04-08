import React from 'react';
import './LibNode.css';
import { useDispatch } from 'react-redux';
const fs = window.require("fs");

function importNode(path, dispatch) {
    fs.readFile(path, (err, data) => {
        if (err) throw err;
        dispatch({type: "NEW_NODE", nodeType: "graph", data: JSON.parse(data), path});
    });
}

function LibNode(props) {
    const {name, obgPath} = props.data;
    const search = props.search;
    const dispatch = useDispatch();

    if (search !== "" && !name.includes(search))
        return null;

    return (
        <div className="LibNode" onClick={() => importNode(obgPath, dispatch)}>
            {name}
        </div>
    );
}

export default LibNode;
