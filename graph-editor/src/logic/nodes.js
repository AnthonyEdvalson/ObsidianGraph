import { DELETE_PORT, ADD_PORT, CHANGE_PORT } from "../reducers/port";
import { conformToSchema } from "../UI/Schema/Schema";
import graphs from './graphs';

function refreshInterface(oldNodeId, graph, state) {
    let oldNode = graph.nodes[oldNodeId];

    if (oldNode.type !== "graph")
        return graph;

    let ref = graphs.getGraphFromLocation(state, oldNode.location);
    let newNode = { ...oldNode };

    // Update ports

    let inter = {
        inputs: {},
        output: null,
        schema: null
    };
    
    for (let [nodeId, node] of Object.entries(ref.nodes)) {
        if (node.type === "in")
            inter.inputs[nodeId] = { label: node.name, valueType: node.valueType };

        if (node.type === "out")
            inter.output = node.name;
        
        if (node.type === "edit")
            inter.schema = JSON.parse(node.schema);
    }
    
    let unused = new Set(Object.keys(inter.inputs));
    for (let portId of newNode.inputs) {
        let port = graph.ports[portId];

        // Resolve Input

        if (port.interId in inter.inputs) {
            let portDef = inter.inputs[port.interId];

            if (port.label !== portDef.label || port.valueType !== portDef.valueType ||
                (port.pin && port.valueType === "list") || (port.pins && port.valueType !== "list")) {
                graph = CHANGE_PORT(graph, { port: portId, change: port => ({
                    ...port,
                    ...portDef
                })});
                newNode = graph.nodes[oldNodeId];
            }
            unused.delete(port.interId)
        }
        else {
            graph = DELETE_PORT(graph, { key: portId });
            newNode = graph.nodes[oldNodeId];
        }
    }

    for (let interId of unused) {
        graph = ADD_PORT(graph, { node: oldNodeId, ...inter.inputs[interId], interId });
        newNode = graph.nodes[oldNodeId];
    }
    
    // Update Output

    if (oldNode.output) {
        let outPort = graph.ports[oldNode.output];

        if (inter.output) {
            if (inter.output !== outPort.label) {
                graph = CHANGE_PORT(graph, { port: newNode.output, change: port => ({
                        ...port,
                        label: inter.output
                })});
                newNode = graph.nodes[oldNodeId];
            }
        }
        else {
            graph = DELETE_PORT(graph, { key: newNode.output })
            newNode = graph.nodes[oldNodeId];
        }
    }
    else if (inter.output) {
        graph = ADD_PORT(graph, { node: oldNodeId, label: inter.output, inout: "out" })
        newNode = graph.nodes[oldNodeId];
    }

    // Update Parameters & Schema

    newNode.schema = inter.schema;
    newNode.parameters = conformToSchema(inter.schema, newNode.parameters);
    
    graph.nodes[oldNodeId] = newNode;
    return graph;
}

export default {
    refreshInterface
};
