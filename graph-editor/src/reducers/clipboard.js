import { lookupReducerFactory } from "./util";
import { cleanName } from './node';
import { util } from 'obsidian';

function copy(graph) {
    let clip = {
        nodes: {},
        ports: {},
        pins: {},
        links: {}
    };

    for (let {type, key} of graph.selection.items) {
        switch (type) {
            case "node":
                let node = graph.nodes[key];
                clip.nodes[key] = {...node};
                
                for (let portId of [...node.inputs, node.output]) {
                    let port = graph.ports[portId];
                    clip.ports[portId] = {...port};

                    let pinIds = port.pins || [port.pin];

                    for (let pinId of pinIds) {
                        clip.pins[pinId] = { ...graph.pins[pinId] }; 

                        if (pinId in graph.links) {
                            let link = graph.links[portId];
                            clip.links[portId] = link;
                        }
                    }
                }
                break;
            case "link":
            case "graph":
            default:
                break;
        }
    }

    return clip;
}

function paste(graph, clip) {
    let newGraph = {
        ...graph,
        nodes: { ...graph.nodes },
        ports: { ...graph.ports },
        pins: { ...graph.pins},
        links: { ...graph.links },
        selection: { ...graph.selection, items: [] }
    };

    let pinMap = {};

    for (let node of Object.values(clip.nodes)) {
        let newNodeKey = util.uuid4();

        let nodeCopy = {
            ...node,
            inputs: node.inputs.map(input => pastePort(clip, newGraph, input, newNodeKey, pinMap)),
            output: pastePort(clip, newGraph, node.output, newNodeKey, pinMap),
            x: node.x + 20,
            y: node.y + 20,
            name: cleanName(newGraph.nodes, node.name, newNodeKey)
        };

        newGraph.nodes[newNodeKey] = nodeCopy;
        newGraph.selection.items.push({type: "node", key: newNodeKey});
    }

    for (let [sink, source] of Object.entries(clip.links)) {
        let newSink = pinMap[sink];
        let newSource = pinMap[source];

        if (newSink && newSource) {
            newGraph.links[newSink] = newSource;
        }
    }
    
    return newGraph;
}

function pastePort(clip, newGraph, key, nodeKey, pinMap) {
    let newPortKey = util.uuid4();

    let port = { ...clip.ports[key] };
    port.node = nodeKey;

    if (port.pin)
        port.pin = pastePin(clip, newGraph, port.pin, newPortKey, nodeKey, pinMap);
    if (port.pins)
        port.pins = port.pins.map(p => pastePin(clip, newGraph, p, newPortKey, nodeKey, pinMap));
    
    newGraph.ports[newPortKey] = port;

    return newPortKey;
}

function pastePin(clip, newGraph, pinId, portId, nodeId, pinMap) {
    let newPinId = util.uuid4();

    let pin = { ...clip.pins[pinId] };
    pin.port = portId;
    pin.node = nodeId;

    pinMap[pinId] = newPinId;

    newGraph.pins[newPinId] = pin;

    return newPinId;
}


function COPY(state, action, fullState) {
    let focused = fullState.projects[action.projectId].graphs[action.graphId].present

    return copy(focused);
}


export default lookupReducerFactory({ COPY }, { nodes: {}, ports: {}, pins: {}, links: {} });
export { copy, paste };
