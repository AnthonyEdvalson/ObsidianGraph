import { useMemo } from 'react';
import Graph from './shared/engine';
import graphIndex from './pack/7/_index';


function GraphApp() {
	let graph = useMemo(() => (new Graph(graphIndex, "front")), []);
	return graph.main(null, {});
}

export default GraphApp;