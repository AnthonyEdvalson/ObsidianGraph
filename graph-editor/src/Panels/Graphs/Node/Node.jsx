import React, { useMemo } from 'react';
import './Node.css';
import Port from './Port';
import useSelectable from '../useSelectable';
import { useDrag } from 'react-use-gesture';
import Monaco from '../../Monaco';
import Schema, { getDefaultParams } from '../../../UI/Schema';
import Form from '../../../Form';
import { useGraphDispatch, useNodeSelector } from '../../../logic/scope';
import graphs from '../../../logic/graphs';

function Node(props) {
	const key = props.k;
	const data = useNodeSelector(key);
	let { x, y, name, type, inputs, output, content, schema } = data;

	let [selected, setSelect, dragging] = useSelectable("node", key);
	let moving = dragging || props.moving;

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

	let className = `Node node-${type}` + (selected ? " node-selected" : "") + (dragging ? " node-dragging" : "");
	let style = {transform: `translate(${x}px, ${y}px)`};

	// Memoize the preview becuase they can be very complicated, this way it does not get rendered every time
	// The node moves or has a property changed
	let preview = useMemo(() => {
		if (["front", "back", "agno", "data"].includes(type))
			return <Monaco width="300" height="500" mode="readOnly" value={content} k={key} fontSize={8} />
		else if (type === "edit") {
			let schemaObject;

			try {
				schemaObject = JSON.parse(schema);
			}
			catch {
				return "- Invalid Schema -";
			}

			return (
				<Form.Form data={{ schema: schemaObject, params: getDefaultParams(schemaObject) }} onChange={() => {}}>
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
	}, [content, type, key, schema]);

	let previewStyle = { ...(moving ? {display: "none"} : {}) };

	return (
		<div style={style} className={className} { ...bind() }>

			<div className="node-content">
				<div className="node-info">
					{name}
				</div>
				<div className="node-preview" onDoubleClick={() => handleOpen(data, key, dispatch)} style={previewStyle}>
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
