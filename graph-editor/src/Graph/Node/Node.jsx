import React, { useCallback } from 'react';
import Draggable from '../Draggable';
import './Node.css';
import Port from './Port';
import { useSelector, useDispatch } from 'react-redux';
import useFile, { getFilePath } from '../../useFile';
import launchEditor from '../../launchEditor';
import useSelectable from '../useSelectable';
const fs = window.require("fs");


function Node(props) {
    const key = props.k;
    const data = useSelector(state => state.graph.present.nodes[key]);
    var { x, y, name, type, inputs, output } = data;

    const graphFolder = useSelector(state => state.graph.present.path);
    var [selected, setSelect] = useSelectable("node", key);
    const dispatch = useDispatch();
    let dragHandleMouseDown = useNodeMove(x, y, dispatch);

    //useFile will sync associated file names
    useFile(name, type, graphFolder);

    function handleMouseDown(e) {
        if (e.button === 2)
            handleOpen(data, graphFolder, dispatch);
        
        if (e.button === 0) {
            setSelect(e);
            dragHandleMouseDown(e);
        }
    }

    let className = `Node node-${type}` + (selected ? " node-selected" : "");
    let style = {transform: `translate(${x}px, ${y}px)`};
    
    return (
        <div style={style} onMouseDown={handleMouseDown} className={className}>
            <div className="node-info">
                {name}
            </div>
            <div className="node-preview"></div>
            <div className="node-ports-in">
            {
                inputs.map(key => <Port key={key} k={key} inout="in" />)
            }
            </div>
            <div className="node-ports-out">
                {output && <Port k={output} inout="out" />}
            </div>
        </div>
    );
}


function useNodeMove(x, y, dispatch) {
    const drag = Draggable(x, y, null, useCallback(({dx, dy}) => {
        if (dx && dy)
            dispatch({ type: "MOVE_SELECTION", dx, dy });
    }, [dispatch]));
    return drag.handleMouseDown;
}


function handleOpen(data, graphFolder, dispatch) {
    switch (data.type) {
        case "js": 
        case "py":
        case "data":
            let filePath = getFilePath(data.name, data.type, graphFolder);
            launchEditor(filePath, 1);
            break;
        case "graph":
            fs.readFile(data.path, (err, graphData) => {
                if (err) throw err;
                dispatch({type: "LOAD_GRAPH", data: JSON.parse(graphData), filePath: data.path});
            });
            break;
        default:
    }
}

export default Node;
