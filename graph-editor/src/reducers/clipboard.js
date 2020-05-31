import { makeLookupReducer } from "./util";

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

function COPY(state, action, fullState) {
    return copy(fullState.graph.present);
}


export default makeLookupReducer({ COPY }, { nodes: {}, ports: {}, links: {} });
export { copy };
