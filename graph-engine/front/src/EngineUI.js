import React, { useMemo } from 'react';
import { Courier, Engine } from 'obsidian';
import app from './app';

function EngineUI() {
	let engine = useMemo(() => {
		let courier = new Courier(
			"http://localhost:5000/front", 
			{ 
				onConnect: () => { console.log("Connected!"); },
				onEval: (req) => { engine.evalFromRemote(req)},
				onTest: req => { engine.test(req.functionId) }
			}, 
			true
		)

		let highPrecisionTime = () => performance.timeOrigin + performance.now();
		return new Engine("front", highPrecisionTime, courier, app, true);
	}, []);

	let res = engine.evalRoot();

	if (!React.isValidElement(res))
		return <p>{JSON.stringify(res, null, 2)}</p>
	
	return React.cloneElement(res, {});
}

export default EngineUI;

