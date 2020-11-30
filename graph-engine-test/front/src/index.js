
import React from 'react';
import ReactDOM from 'react-dom';
import engineFactory from './engine';

const DEBUG = true;
const engine = engineFactory(DEBUG);


function EngineUI() {
	let res = engine.evalRoot();

	if (res === undefined)
		throw new Error("The ouptut of the graph 'Main' is undefined")

	if (!React.isValidElement(res))
		return <p>{JSON.stringify(res, null, 2)}</p>
	
	return React.cloneElement(res, {}); // TODO don't clone???
}

ReactDOM.render(
	<React.StrictMode>
		<EngineUI />
 	</React.StrictMode>,
	document.getElementById('root')
);


const reportWebVitals = onPerfEntry => {
	if (onPerfEntry && onPerfEntry instanceof Function) {
		import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
			getCLS(onPerfEntry);
			getFID(onPerfEntry);
			getFCP(onPerfEntry);
			getLCP(onPerfEntry);
			getTTFB(onPerfEntry);
		});
	}
};

reportWebVitals(console.log);