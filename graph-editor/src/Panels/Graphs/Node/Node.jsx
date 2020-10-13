import React, { useMemo } from 'react';
import './Node.css';
import Port from './Port';
import useSelectable from '../useSelectable';
import { useDrag } from 'react-use-gesture';
import Schema, { getDefaultParams } from '../../../UI/Schema';
import Form from '../../../Form';
import { useGraphDispatch, useNodeSelector } from '../../../logic/scope';
import graphs from '../../../logic/graphs';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

function Node(props) {
	const key = props.k;
	const data = useNodeSelector(key);
	let { x, y, name, type, inputs, output, content, schema } = data;

	let { selected, setSelect, dragging, error } = useSelectable("node", key);

	const dispatch = useGraphDispatch();

	function handleOpen() {
		switch (type) {
			case "front": 
			case "back":
			case "agno":
			case "data":
				props.setEditingNodeId(key);
				break;
			case "graph":
				let { graphId, projectId } = data.location
				graphs.openGraph(dispatch, graphId, projectId);
				break;
			default:
		}
	}

	const bind = useNodeMove(() => handleOpen(data, key, dispatch), setSelect, dispatch, props.transform);

	let className = `Node node-${type}`;

	if (selected)
		className += " node-selected";
	if (dragging)
		className += " node-dragging";
	if (error)
		className += " node-error";


	let style = {transform: `translate(${x}px, ${y}px)`};

	// Memoize the preview becuase they can be very complicated, this way it does not get rendered every time
	// The node moves or has a property changed
	let preview = useMemo(() => {
		if (["front", "back", "agno", "data"].includes(type))
			return <div className="code-preview"><Editor 
				value={ content }
				highlight={code => highlight(code, languages.js)}
				tabSize={4}
			/></div>
		else if (type === "edit") {
			let schemaObject, defaultParams;

			try {
				schemaObject = JSON.parse(schema);
				defaultParams = getDefaultParams(schemaObject);
			}
			catch {
				return "- Invalid Schema -";
			}

			return (
				<Form.Form data={{ schema: schemaObject, params: defaultParams}} onChange={() => {}}>
					<Schema k="schema" dk="params"/>
				</Form.Form>
			);
		}
		else if (type === "graph") {
			return null;
			/*return (
				<GraphRender graphId={subgraphId} moving={true} transform={{x: 400, y: 200, s: 0.2}} />
			)*/
		}
		
		return null;
	}, [content, type, schema]);

	//let previewStyle = { ...(moving ? {display: "none"} : {}) };

	return (
		<div style={style} className={className} { ...bind() }>

			<div className="node-content">
				<div className="node-info">
					{name}
				</div>
				<div className="node-preview" onDoubleClick={() => handleOpen(data, key, dispatch)}>
					<div className="node-preview-net" />
					{preview}
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

/*
element.style {
    font-size: 8px;
    color: white;
    background-color: #00081060;
    width: 100%;
    height: 100%;
    padding: 10px;
}*/


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
					dispatch({ type: "MOVE_SELECTION", dx, dy, transform});
					if (first)
						dispatch({ type: "SET_DRAGGING", dragging: true});
				}
			}

			if (last) {
				dispatch({ type: "SET_DRAGGING", dragging: false, snap: 50});
			}
		},
		{ filterTaps: true, delay: true }
	);

	return bind;
}

export default Node;
