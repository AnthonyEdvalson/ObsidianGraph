import { makeLookupReducer } from "./util";
import { cleanName } from './node';
import { util } from 'obsidian';

function copy(graph) {
    let clip = {
        nodes: {},
        ports: {},
        links: {}
    };

    for (let {type, key} of graph.selection.items) {
        switch (type) {
            case "node":
                let node = graph.nodes[key];
                clip.nodes[key] = {...node};
                
                for (let portKey of [...node.inputs, node.output]) {
                    let port = graph.ports[portKey];
                    clip.ports[portKey] = {...port};

                    if (portKey in graph.links) {
                        let link = graph.links[portKey];
                        clip.links[portKey] = link;
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
        links: { ...graph.links },
        selection: { ...graph.selection, items: [] }
    };

    let portMap = {};

    for (let [, node] of Object.entries(clip.nodes)) {
        let newNodeKey = util.uuid4();

        let nodeCopy = {
            ...node,
            inputs: node.inputs.map(input => pastePort(clip, newGraph, input, newNodeKey, portMap)),
            output: pastePort(clip, newGraph, node.output, newNodeKey, portMap),
            x: node.x + 20,
            y: node.y + 20,
            name: cleanName(newGraph.nodes, node.name, newNodeKey)
        };

        newGraph.nodes[newNodeKey] = nodeCopy;
        newGraph.selection.items.push({type: "node", key: newNodeKey});
    }

    for (let [sink, source] of Object.entries(clip.links)) {
        let newSink = portMap[sink];
        let newSource = portMap[source];

        if (newSink && newSource) {
            newGraph.links[newSink] = newSource;
        }
    }
    
    return newGraph;
}

function pastePort(clip, newGraph, key, nodeKey, portMap) {
    let newPortKey = util.uuid4();

    let port = clip.ports[key];
    port.node = nodeKey;
    newGraph.ports[newPortKey] = port;

    portMap[key] = newPortKey;

    return newPortKey;
}

function COPY(state, action) {
    return {
        ...state,
        clipboard: copy(state.project.graphs[action.graphId].present)
    }
}

function PASTE(state, action, fullState) {
    let newState = {
        ...state,
        project: {
            ...state.project,
            graphs: {
                ...state.project.graphs
            }
        }
    }
    let graphs = newState.project.graphs;
    let graphId = action.graphId;
    let clipboard = state.clipboard;

    graphs[graphId].present = paste(graphs.graphId.present, clipboard);

    return newState;
}

function DUPLICATE(state, action, fullState) {
    let clip = copy(state);
    return paste(state, clip);
}


export default makeLookupReducer({ COPY, PASTE, DUPLICATE }, { nodes: {}, ports: {}, links: {} });
export { copy };
