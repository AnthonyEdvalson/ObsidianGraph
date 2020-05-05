class Graph {
	constructor(gDef, pack) {
		if (!(gDef && gDef.nodes))
			throw new Error("Unable to load graph definition: '" + JSON.stringify(gDef));

		this.output = gDef["output"];
		this.pack = pack;

		this.nodes = {};
		for (let [k, v] of Object.entries(gDef.nodes)) {
			this.nodes[k] = new Node(v, k, this);
		}
	}

	run(startNode, params) {
		// Makes a load function that automatically passes in params
		// That load function is then also passed in as a param for use within the nodes
		/*let loadFactory = nodeObj => {
			let load = (label => { 
				return this.loadWithParams(node, { load, ...params });
			});
		}*/

		return this.loadWithParams(startNode, params);
	}

	loadWithParams(node, params) {
		if (!(node in this.nodes))
			throw new Error("Cannot execute the node '" + node + "', valid names are: " + JSON.stringify(Object.keys(this.nodes)))

		return this.nodes[node].load(params);
	}
}

class Node {
	constructor(data, key, graph) {
		if (data.inputs)
			this.ins = data.inputs;
			
		this.load = () => {};

		if (data.type === "code") {
			let mod = graph.pack[key];
			let code = mod.main;

			this.load = (params) => {
				let o = {
					ins: data.inputs,
					load: (label) => graph.loadWithParams(data.inputs[label], params),
					...params
				};

				if (params.useRemote)
					o.useRemote = (label, args) => params.useRemote(data.inputs[label], args);
				
				
				//useRemoteAction: 
				return code(o);
			};
		}

		if (data.type === "data")
			this.load = () => graph.pack[key];
	}
}

module.exports = Graph;