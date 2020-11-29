import React, { useRef } from 'react';
import { useGesture } from 'react-use-gesture';
import './Panner.css';

function clientToGraph(x, y, gt, translate=true) {
	return [
		(x - (translate ? gt.x : 0)) / gt.s,
		(y - (translate ? gt.y : 0)) / gt.s
	]
}

function move(t, { dx, dy, ds, pivot }) {
	let newT = { ...t };

	if (ds) {
		let [x, y] = clientToGraph(pivot.x, pivot.y, t);
		newT.s = Math.exp(Math.log(t.s) + ds);
		let ms = t.s / newT.s - 1;
		newT.x += ms * x * newT.s;
		newT.y += ms * y * newT.s;
	}

	newT.x += dx || 0;
	newT.y += dy || 0;
	
	return newT;
}

function Panner(props) {
	let t = props.transform;
	let setTransform = props.setTransform;
	let zoomSensitivity = props.zoomSensitivity;
	
	let updateMoving = (first, last) => {
		if (first && props.setMoving)
			props.setMoving(true);

		if (last && props.setMoving)
			props.setMoving(false);
	}

	const ref = useRef(null);
	let bind = useGesture({
			onPinch: ({ previous, da, origin, first, last }) => {
				updateMoving(first, last);
				setTransform(move(t, {
					ds: (da[0] - previous[0]) / 200 * zoomSensitivity, 
					pivot: {x: origin[0], y: origin[1]}}));
			},
			onWheel: ({delta, first, last }) => {
				updateMoving(first, last);
				let dx = -delta[0];
				let dy = -delta[1];
				setTransform(move(t, { dx, dy })); 
			},
			onDrag: ({event, movement, initial, ctrlKey, tap, buttons, delta, first, last}) => {
				if (event.__stop)
					return;

				updateMoving(false, last);

				if (buttons === 4) {
					updateMoving(first, last);
					setTransform(move(t, {dx: delta[0], dy: delta[1]}));
					return;
				}

				if (props.handleDrag) {
					let [x, y] = clientToGraph(...initial, t);
					let [width, height] = clientToGraph(...movement, t, false);

					x = Math.min(x, x + width);
					y = Math.min(y, y + height);
					width = Math.abs(width);
					height = Math.abs(height);

					let region = { x, y, width, height };

					event.stopPropagation();
					props.handleDrag(event.buttons, region, ctrlKey, tap, last);
				}
			},
		},
		{ 
			drag: { filterTaps: true }, 
			//eventOptions: { passive: false }, 
			//domTarget: ref 
		}
	);

	let style = {};
	if (!props["no-transform"])
		style = {transform: `scale(${t.s}) translate(${(t.x - 345) / t.s}px, ${(t.y - 30) / t.s}px)`};

	//React.useEffect(bind, [bind])

	return (
		<div>
			<div className="navigation-bar">
				<button onClick={() => setTransform(move(t, { ds:  0.25, pivot: {x:0, y:0} }))}>+</button>
				<button onClick={() => setTransform(move(t, { ds: -0.25, pivot: {x:0, y:0} }))}>-</button>
				<button onClick={() => setTransform({ x: 0, y: 0, s: 1 })}>h</button>
			</div>
			<div className="Panner" {...bind()} ref={ref} style={style}>
				{ props.children }
			</div>
		</div>
	)
}

export default Panner;
export { clientToGraph };