import React, { useMemo } from 'react';
import './Node.css';
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
import { useRef } from 'react';
import Ports from './Ports';

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

	const [bind, ref] = useNodeMove(() => handleOpen(data, key, dispatch), setSelect, dispatch, props.transform);

	let className = `Node node-${type}`;

	if (selected)
		className += " node-selected";
	if (dragging)
		className += " node-dragging";
	if (error)
		className += " node-error";


	let style = useMemo(() => ({ transform: `translate(${x}px, ${y}px)`}), [x, y]);

	// Memoize the preview becuase they can be very complicated, this way it does not get rendered every time
	// The node moves or has a property changed
	let preview = useMemo(() => {
		if (["front", "back", "agno", "data"].includes(type))
			return (
				<div className="code-preview"><Editor 
					value={ content }
					highlight={code => highlight(code, languages.js)}
					tabSize={4} />
				</div>
			)
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
		}
		
		return null;
	}, [content, type, schema]);


	let outputs = useMemo(() => output ? [output] : [], [output]);
	
	return (
		<div style={style} className={className} { ...bind() } ref={ref}>

			<div className="node-content">
				<div className="node-info">
					{name}
				</div>
				<div className="node-preview" onDoubleClick={() => handleOpen(data, key, dispatch)}>
					<div className="node-preview-net" />
					{preview}
				</div>
				<Ports in ports={inputs} />
				<Ports out ports={outputs} />
			</div>
		</div>
	);
}

function useNodeMove(handleOpen, setSelect, dispatch, transform) {
	let ref = useRef(null);

	let bind = useDrag(
		({event, delta: [dx, dy], tap, buttons, last, first}) => {
			if (event.__stop)
				return;
			event.__stop = true;
			
			if (event.button === 0)
				setSelect(event);

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
		{ 
			filterTaps: true, 
			delay: true
		}
	);

	return [bind, ref];
}

export default Node;
