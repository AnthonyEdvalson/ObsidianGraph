import React, { useMemo, useContext } from 'react';
import './Node.css';
import Port from './Port';
import { useDispatch } from 'react-redux';
import useSelectable from '../useSelectable';
import { useDrag } from 'react-use-gesture';
import MonacoEditor from 'react-monaco-editor';
import graphs, { useGraphSelector, OpenGraphContext } from '../../../logic/graphs';
import nodes from '../../../logic/nodes';


function Node(props) {
	const key = props.k;
	const data = useGraphSelector(graph => graph.nodes[key])
	let graphKey = useContext(OpenGraphContext);
	var { x, y, name, type, inputs, output, content } = data;

	var [selected, setSelect, dragging] = useSelectable("node", key);
	let moving = dragging || props.moving;

	const dispatch = useDispatch();
	const bind = useNodeMove(() => handleOpen(data, key, graphKey, dispatch), setSelect, dispatch, props.transform);

	let className = `Node node-${type}` + (selected ? " node-selected" : "") + (dragging ? " node-dragging" : "");
	let style = {transform: `translate(${x}px, ${y}px)`};

	// Memoize the editor becuase it contains a huge number of elements, this way it does not get rendered nearly as much
	let preview = useMemo(() => {
		if (type !== "front" && type !== "back" && type !== "data")
			return null;

		return <MonacoEditor
			width="300"
			height="200"
			language="javascript"
			theme="vs-dark"
			options={{readOnly: true, mouseStyle: "default", minimap: {enabled: false}, showFoldingControls: true, showUnused: true, lineNumbersMinChars: 3}}
			value={content}
		/>
	}, [content, type]);

	return (
		<div style={style} className={className} { ...bind() }>

			<div className="node-content">
				<div className="node-info">
					{name}
				</div>
				<div className="node-preview" onDoubleClick={() => handleOpen(data, key, graphKey, dispatch)}>
					<div className="node-preview-net" />
					{moving ? null : preview}
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

			if (last) {
				dispatch({ type: "SET_DRAGGING", dragging: false, snap: 50 });
			}
		},
		{ filterTaps: true, delay: true }
	);

	return bind;
}


function handleOpen(data, key, graphKey, dispatch) {
	switch (data.type) {
		case "front": 
		case "back":
		case "data":
			nodes.showEditNode(key, graphKey, dispatch);
			break;
		case "graph":
			graphs.openGraph(data.location, dispatch);
			break;
		default:
	}
}

export default Node;
