import { util } from 'obsidian';

const upgrades = {
    "1": upgradeV1,
    "1.0": upgradeV1_0
}

function outdated(v) {
    return v in upgrades;
}

function upgrade(obp) {
    while (obp.v in upgrades) {
        obp = upgrades[obp.v](obp);
    }

    return obp;
}

// Upgrades

function upgradeV1(obp) {
    // Update each graph...
    util.transform(obp.graphs, graph => {

        // Add pins, one for each port
        let pins = {};
        let portPinMap = {};

        for (let [portId, port] of Object.entries(graph.ports)) {
            // Create the pin
            let pinId = util.uuid4();
            pins[pinId] = { port: portId, node: port.node }

            // Update port to reference it
            graph.ports[portId].pin = pinId;
            graph.ports[portId].valueType = "value";

            portPinMap[portId] = pinId;
        }
        graph.pins = pins;

        let newLinks = {};

        // Update links to reference the pin instead of port.
        for (let [sink, source] of Object.entries(graph.links))
            newLinks[portPinMap[sink]] = portPinMap[source];
        
        graph.links = newLinks;

        return graph;
    });

    obp.v = "1.0";
    return obp;
}

function upgradeV1_0(obp) {
    util.transform(obp.graphs, graph => {
        util.transform(graph.nodes, (node, nodeId) => {
            if (node.type !== "in")
                return node;
            
            let portId = util.uuid4();
            let pinId = util.uuid4();

            graph.ports[portId] = {
                label: "Default",
                valueType: node.valueType,
                node: nodeId,
            }

            if (node.valueType === "list")
                graph.ports[portId].pins = [pinId];
            else
                graph.ports[portId].pin = pinId;
            
            graph.pins[pinId] = {
                port: portId,
                node: nodeId
            };

            node.inputs.push(portId);
        });
    })

    obp.v = "1.1";
    return obp;
}
export default { upgrade, outdated };