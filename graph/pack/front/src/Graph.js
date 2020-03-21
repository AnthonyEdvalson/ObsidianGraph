import React from 'react';
import { useRemote } from './obsidian';


class Graph {
    constructor(data) {
        this.output = data["output"];
        this.nodes = {};
        for (let [k, v] of Object.entries(data.nodes)) {
            this.nodes[k] = new Node(v, k, this);
        }
    }

    load(node) {
        return this.nodes[node].load();
        /*
        try {
            //trace.push(["call", node]);
            if (!node || !(node in this.nodes))
                throw Error(node + " Is an invalid node name");
            //let v = this.nodes[node].load();
            //trace.pop();
            return v;
        } catch (e) {
            //e.message += "\n(" + trace.join(") > (") + ")";
            throw e;
        }*/
    }
}

class Node {
    constructor(data, key, parent) {
        this.key = key;
        this.graph = parent;
        this.path = data.code;
        this.inputs = data.inputs;
    }


    load() {
        let component = require("./" + this.path).default;
        let o = {
            ins: this.inputs,
            load: (node_name, load_args={}) => this.graph.load(node_name),
            useRemote: useRemote
        };
        return (<div className="Subitem">{React.createElement(component, o)}</div>);
    }
}

function GraphRender() {
    let [loaded, gData, failed] = useRemote("@get graph", {});

    if (failed)
        return (<span>Failed to load</span>);
    if (!loaded)
        return (<span>Loading</span>);
    
    let g = new Graph(gData);
    return g.load(g.output, null, [])
}

export default GraphRender;
