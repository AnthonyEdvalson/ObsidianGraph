import React, { useState } from 'react';
import './Node.css';
import Port from './Port';
import { useSelector, useDispatch } from 'react-redux';
import useFile from '../../../useFile';
import launchEditor from '../../../launchEditor';
import useSelectable from '../useSelectable';
import { useDrag } from 'react-use-gesture';
import { getFilePath, getGraphPath } from '../../../logic/paths';
import MonacoEditor from 'react-monaco-editor';
const fs = window.require("fs");


function Node(props) {
	const key = props.k;
	const data = useSelector(state => state.graph.present.nodes[key]);
	var { x, y, name, type, inputs, output } = data;

	const graphFolder = useSelector(state => state.graph.present.path);
	var [selected, setSelect, dragging] = useSelectable("node", key);
	const dispatch = useDispatch();
	const bind = useNodeMove(() => handleOpen(data, graphFolder, dispatch), setSelect, dispatch, props.transform);
	let [code, setCode] = useState("let message = \"this is a test\"");

	//useFile will sync associated file names
	useFile(name, type, graphFolder);

	let className = `Node node-${type}` + (selected ? " node-selected" : "") + (dragging ? " node-dragging" : "");
	let style = {transform: `translate(${x}px, ${y}px)`};
	
	return (
		<div style={style} className={className} { ...bind() }>
			<div className="node-content">
				<div className="node-info">
					{name}
				</div>
				<div className="node-preview">
					<MonacoEditor
						width="300"
						height="200"
						language="javascript"
						theme="vs-dark"
					/>

						{/*value={code}onChange={setCode}*/}
				</div>
				<div className="node-ports-in">
				{
					inputs.map(key => <Port key={key} k={key} inout="in" />)
				}
				</div>
				<div className="node-ports-out">
					{output && <Port k={output} inout="out" />}
				</div>
			</div>
		</div>
	);
}


function useNodeMove(handleOpen, setSelect, dispatch, transform) {
	let bind = useDrag(
		({event, delta: [dx, dy], tap, buttons, last, first}) => {
			event.__stop = true;

			if (event.button === 0)
				setSelect();

			if (tap) {
				if (event.button === 2)
					handleOpen();
			} 
			else
			{
				if (buttons === 1) {
					dispatch({ type: "MOVE_SELECTION", dx, dy, transform });
					if (first)
						dispatch({ type: "SET_DRAGGING", dragging: true});
				}
			}

			if (last)
				dispatch({ type: "SET_DRAGGING", dragging: false})
		},
		{ filterTaps: true }
	);

	return bind;
}


function handleOpen(data, graphFolder, dispatch) {
	switch (data.type) {
		case "front": 
		case "back":
		case "data":
			let filePath = getFilePath(data.name, data.type, graphFolder);
			launchEditor(filePath, 1);
			break;
		case "graph":
			fs.readFile(getGraphPath(data.location), (err, graphData) => {
				if (err) throw err;
				dispatch({type: "LOAD_GRAPH", data: JSON.parse(graphData), filePath: data.path});
			});
			break;
		default:
	}
}

export default Node;
