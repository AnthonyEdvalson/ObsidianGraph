import { DELETE_PORT, ADD_PORT, CHANGE_PORT } from "../reducers/port";
import graphs from './graphs';

function refreshInterface(nodeId, graph, state) {
    let node = graph.nodes[nodeId];

    if (node.type !== "graph")
        return graph;

    let ref = graphs.getGraphFromLocation(state, node.location);

    // Update ports

    let inter = {
        inputs: {},
        output: null,
        schema: null
    };
    for (let [nodeId, node] of Object.entries(ref.nodes)) {
        if (node.type === "in")
            inter.inputs[nodeId] = node.name;

        if (node.type === "out")
            inter.output = node.name;
        
        if (node.type === "schema")
            inter.schema = JSON.parse(node.schema);
    }

    let unused = new Set(Object.keys(inter.inputs));
    for (let portId of node.inputs) {
        let port = graph.ports[portId];

        // Resolve Input

        if (port.interId in inter.inputs) {
            if (inter.inputs[port.interId] !== port.label) {
                graph = CHANGE_PORT(graph, { port: portId, change: port => ({
                    ...port,
                    label: inter.inputs[port.interId]
                })});
            }
            unused.delete(port.interId)
        }
        else {
            graph = DELETE_PORT(graph, { key: portId });
        }
    }

    for (let interId of unused) {
        graph = ADD_PORT(graph, { node: nodeId, label: inter.inputs[interId], interId });
    }
    
    // Update Output

    if (node.output) {
        let outPort = graph.ports[node.output];

        if (inter.output) {
            if (inter.output !== outPort.label) {
                graph = CHANGE_PORT(graph, { port: node.output, change: port => ({
                        ...port,
                        label: inter.output
                })});
            }
        }
        else {
            graph = DELETE_PORT(graph, { key: node.output })
        }
    }
    else if (inter.output) {
        graph = ADD_PORT(graph, { node: nodeId, label: inter.output, output: true})
    }

    // Update Parameters & Schema

    

    return graph;
}

export default {
    refreshInterface
};
