import React, { useMemo } from 'react';
import { Courier, Engine } from 'obsidian';
import app from './app';

function EngineUI() {
	let courier = useMemo(() => new Courier("http://localhost:5000/front", { onConnect: () => { console.log("Connected!"); } }, true), []);

	let engine = useMemo(() => {
		let highPrecisionTime = () => performance.timeOrigin + performance.now();
		return new Engine("front", highPrecisionTime, courier, app, true);
	}, [courier]);

	let res = engine.eval();

	if (!React.isValidElement(res))
		throw new Error("Top level function must return a react object, you returned " + JSON.stringify(res, null, 2));
	
	return React.cloneElement(res, {});
}

export default EngineUI;