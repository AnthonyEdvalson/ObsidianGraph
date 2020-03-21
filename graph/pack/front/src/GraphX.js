import React from 'react';
import { useRemote } from './obsidian';


function Graph(graph_o) {
  let [loaded, data] = useRemote("get graph-o0", "path" in graph_o ? {path: graph_o.path} : {});

  if (!loaded)
    return <span>Loading</span>;

  let nodes = Object.fromEntries(data.map((item) => {return [item.name, item]}));
  let output = data.find(x => x.type === "output");

  let load = (node_name) => {
    if (!(node_name in nodes))
      throw Error(node_name + " is not a valid name. Valid options are [" + Object.keys(nodes).join(", ") + "]");

    let node = node_name ? nodes[node_name] : output.name;
    let t = node.type;
    let o = {node, ins: node.inputs, load, useRemote};

    if (t === "python") {
      throw Error("Cannot run backend nodes on frontend. Replace 'load' with 'useRemote'");
    }
    else if (t === "js") {
      let component = require("./" + node.path).default;
      return (<div className="Subitem">{React.createElement(component, o)}</div>);
    }
    else if (t === "input") {
      return graph_o.load(graph_o.ins[node["name"]])
    }
    else if (t === "output") {
      return load(node["inputs"]["out"])
    }
    else if (t === "graph") {
      return (<div className="Graph">{React.createElement(Graph, {...o, path: node["path"] })}</div>);
    }
    else if (t === "data") {
      throw Error("Not Implemented");
    }
    else {
      throw Error("Unknown type " + t)
    }
  };

  return load(output.name);
}


export default Graph;
