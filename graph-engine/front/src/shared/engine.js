class Graph {
	constructor(gDef, pack) {
		if (!(gDef && gDef.nodes))
			throw new Error("Unable to load graph definition: '" + JSON.stringify(gDef));

		this.output = gDef["output"];
		this.pack = pack;
 
		this.nodes = {};
		for (let [k, v] of Object.entries(gDef.nodes)) {
			this.nodes[k] = new makeNode(v, k, this);
		}
	}

	run(startNode, params) {
		// Makes a load function that automatically passes in params
		// That load function is then also passed in as a param for use within the nodes
		function load(node) { 
			return this.loadWithParams(node, { load, ...params });
		}
		load = load.bind(this);

		return load(startNode);
	}

	loadWithParams(node, params) {
		if (!(node in this.nodes))
			throw new Error("Cannot execute the node '" + node + "', valid names are: " + JSON.stringify(Object.keys(this.nodes)))

		return this.nodes[node](params);
	}
}

function makeNode(data, key, graph) {
	if (data.type === "code") {
		let code = graph.pack[key];

		return (params) => {
			let o = {
				ins: data.inputs,
				...params
			};
			return code(o);
		};
	}

	if (data.type === "data")
		return () => graph.pack[key];
}


module.exports = Graph;