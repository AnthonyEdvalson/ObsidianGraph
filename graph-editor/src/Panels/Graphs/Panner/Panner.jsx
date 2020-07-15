import React from 'react';
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
		let ms = newT.s / t.s;
		newT.x -= (1 - 1 / ms) * x * newT.s;
		newT.y -= (1 - 1 / ms) * y * newT.s;
	}

	newT.x += dx || 0;
	newT.y += dy || 0;
	
	return newT;
}

function Panner(props) {
	let t = props.transform;
	let setTransform = props.setTransform;

	let updateMoving = (first, last) => {
		if (first)
			props.setMoving(true);

		if (last)
			props.setMoving(false);
	}

	let bind = useGesture({
			onPinch: ({ previous, da, origin, first, last }) => {
				updateMoving(first, last);
				setTransform(move(t, {ds: (da[0] - previous[0]) / 200, pivot: {x: origin[0], y: origin[1]}}))
			},
			onWheel: ({delta, first, last }) => {
				updateMoving(first, last);
				let dx = delta[0];
				let dy = delta[1];
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
				
				let [x, y] = clientToGraph(...initial, t);
				let [width, height] = clientToGraph(...movement, t, false);
				let region = { x, y, width, height };
				props.handleDrag(event.button, region, ctrlKey, tap, last);
			},
		},
		{ drag: { filterTaps: true } }
	);

	return (
		<div className="Panner" { ...bind() } style={{transform: `scale(${t.s}) translate(${(t.x - 300) / t.s}px, ${(t.y - 30) / t.s}px)`}}>
			<div className="navigation-bar">
				<button>+</button>
				<button>-</button>
			</div>
			{ props.children }
		</div>
	)
}

export default Panner;