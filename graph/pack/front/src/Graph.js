import React from 'react';
import { useRemote } from './obsidian';
import front from "./app/_front.json";


class Graph {
    constructor(data) {
        this.output = data["output"];
        this.nodes = {};
        for (let [k, v] of Object.entries(data.nodes)) {
            this.nodes[k] = new Node(v, k, this);
        }
    }

    load(node) {
      if (node in this.nodes)
        return this.nodes[node].load();
      else
        throw new Error("Cannot execute node " + node + ", only " + JSON.stringify(Object.keys(this.nodes)) + " allowed")
    }
}

class Node {
    constructor(data, key, parent) {
        this.key = key;
        this.graph = parent;
        this.type = data.type;

        if (this.type === "code") {
            this.inputs = data.inputs;
            this.code = require("./app/" + this.key).default;
        }
        else if (this.type === "data") {
            this.data = JSON.parse(data.file);
        }
    }


    load() {
        if (this.type === "code") {
            let o = {
                //ins: (this.inputs,
                //load: (node_name, load_args = {}) => this.graph.load(node_name),
                load: (label) => this.graph.load(this.inputs[label]),
                useRemote: (label, args) => useRemote(this.inputs[label], args)
            };
            return (<div className="Subitem">{React.createElement(this.code, o)}</div>);
        }
        else if (this.type === "data") {
            return this.data;
        }
    }
}

function GraphRender() {
    //let [loaded, gData, failed] = useRemote("@get graph", {});

    //if (failed)
    //    return (<span>Failed to load</span>);
    //if (!loaded)
    //    return (<span>Loading</span>);
    
    let g = new Graph(front);
    return g.load(g.output, null, [])
}

export default GraphRender;
