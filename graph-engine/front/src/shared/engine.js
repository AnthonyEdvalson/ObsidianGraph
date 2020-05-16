class Graph {
	constructor(index, side, params=null, inputs={}) {
		let gDef = index.graph;
		if (!(gDef && gDef.nodes))
			throw new Error("Engine Error: Unable to load graph definition: '" + JSON.stringify(gDef) + "'");

		this.output = gDef.output;
		this.recv = gDef.recv;

		this.iargs = { meta: gDef.meta, side, params, inputs };

		this.nodes = {};
		for (let [k, v] of Object.entries(gDef.nodes))
			this.nodes[k] = new Node(v, k, this, index);
	}

	main(node, args) {
		node = node || this.output;
		
		if (node in this.nodes)
			return this.nodes[node].main(args, this.iargs);

		if (this.recv.indexOf(node) >= 0)
			return call(node, args, new Error());
		
		throw new Error("Engine Error: Cannot find the node '" + node + "'. " + 
			"Local names include: " + Object.keys(this.nodes).sort().join(", ") + ". " +
			"Universal names include: " + Object.values(this.recv).sort().join(", "));
	}
}

class Node {
	constructor(node, key, graph, index) {
		this.key = key;
		this.main = () => {throw new Error("Engine Error: Main function not defined for node: " + JSON.stringify(node))};

		if (node.type === "code") {
			let mod = index.nodes[key];

			this.main = (args, iargs) => {
				let o = this.makeO(graph, node.inputs, args, iargs);
				return mod.main(o);
			};
		}

		if (node.type === "data") {
			let value = JSON.parse(index.nodes[key]);
			this.main = () => value;
		}
		
		if (node.type === "graph") {
			let inputs = {};
			for (let [k, v] of Object.entries(node.inputs))
				inputs[k] = inArgs => graph.main(v, inArgs);

			let subgraph = new Graph(index.nodes[node.graphName], graph.side, node.parameters, inputs);
			this.main = (args, iargs) => subgraph.main(null, args);
		}

		if (node.type === "in") {
			this.main = (args, iargs) => iargs.inputs[node.label](args);
		}

		if (node.type === "edit") {
			this.main = (_, iargs) => {
				return iargs.params;
			}
		}
	}

	validateLabel(label, inputs, fname) {
		if (!(label in inputs))
			throw new Error(`Cannot ${fname}('${label}') in node '${this.key}', valid labels are '${Object.keys(inputs).join("', '")}'.`)
	}
	
	makeO(graph, inputs, args, iargs) {

		let load = (label, reqArgs={}) => {
			this.validateLabel(label, inputs, "load");
			return graph.main(inputs[label], reqArgs);
		}

		return {
			...args,
			load,
			loadAsync: async (label, reqArgs={}) => {
				this.validateLabel(label, inputs, "loadAsync");
				return load(label, reqArgs);
			}
		};
	}
}


function call(node, args, pinnedError) {
	if (typeof(args) === "undefined")
		args = {};

	if (args === null || typeof(args) !== "object")
		throw Error("Args should be an object containing argument names and values, not '" + typeof(args) + "'");

    let body = JSON.stringify({ node, args }, null, 2);
	
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

module.exports = Graph;