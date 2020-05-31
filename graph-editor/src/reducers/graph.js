import { uuid4, cleanName } from "./node";
import { copy } from "./clipboard";
import { makeLookupReducer } from "./util";  

function clientToGraph(x, y, gt) {
    return {
        x: (x - gt.x) / gt.scale,
        y: (y - gt.y) / gt.scale
    }
}

function MOVE_GRAPH(state, {ds, dy, dx, pivot}) {
    let newState = {
        ...state,
        transform: { ...state.transform }
    };

    if (ds) {
        let {x, y} = clientToGraph(pivot.x, pivot.y, newState.transform);
        newState.transform.scale *= ds;
        newState.transform.x -= (x * (1 - 1 / ds)) * newState.transform.scale;
        newState.transform.y -= (y * (1 - 1 / ds)) * newState.transform.scale;
    }
    if (dx)
        newState.transform.x += dx;
    if (dy)
        newState.transform.y += dy;
    return newState;
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
        let newNodeKey = uuid4();

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
    let newPortKey = uuid4();

    let port = clip.ports[key];
    port.node = nodeKey;
    newGraph.ports[newPortKey] = port;

    portMap[key] = newPortKey;

    return newPortKey;
}

function PASTE(state, action, fullState) {
    return paste(state, fullState.clipboard);
}

function DUPLICATE(state, action) {
    let clip = copy(state);
    return paste(state, clip);
}


export default makeLookupReducer({ MOVE_GRAPH, PASTE, DUPLICATE }, {});
