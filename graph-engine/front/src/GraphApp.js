import { useState, useEffect, useCallback } from 'react';
import gDef from './pack/_graph.json';
import Graph from './shared/engine';
import pack from './pack/_index';


function call(node, args, pinnedError) {
	if (typeof(args) === "undefined")
		args = {};

	if (args === null || (typeof args) !== "object")
		throw Error("Args should be an object containing argument names and values, not '" + (typeof args) + "'");
		
  if (typeof(node) !== "string")
    throw Error("Node should be a string, but was " + typeof node);

  let body = JSON.stringify({
    node,
    args
  }, null, 2);
	
	return new Promise((resolve, reject) => {
		fetch('/api/call', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }, 
			credentials: "same-origin",
			body
		}).then(res => {
			if (res.ok)
				resolve(res.json());
			else
				res.json().then(reject, reject);
		});
	});
}

function useRemote(node, args, clearOnRefresh) {
	if (typeof(clearOnRefresh) === "undefined")
		clearOnRefresh = true;

	let [state, setState] = useState({ loading: true, data: null, error: null, refresh: () => {} });
	
	let refresh = useCallback(() => {
			let pinnedError = Error();
			
			if (clearOnRefresh)
				setState(prevState => ({ ...prevState, loading: true, error: null, data: null, refresh }));
			else
				setState(prevState => ({ ...prevState, loading: true, error: null, refresh }));

			call(node, args, pinnedError).then(data => {
				setState(prevState => ({ ...prevState, loading: false, data, error: null }));
			}, error => {
				setState(prevState => ({ ...prevState, loading: false, error }));
			});
		}, [setState, node, args, clearOnRefresh]);

  useEffect(() => {
		refresh();
  }, [refresh]);

  return state;
}

function useRemoteAction() {
  return useCallback((name, args) => {
		let pinnedError = Error();

		return call(name, args, pinnedError);
	}, []);
}


function GraphApp() {
	let graph = new Graph(gDef, pack);
	let params = {
		useRemote,
		useRemoteAction
	}
	//return <span>test</span>
	return graph.loadWithParams(graph.output, params);
}

export default GraphApp;