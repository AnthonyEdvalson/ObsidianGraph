import { newHistory } from "redux-undo";
import { useSelector } from "react-redux";
import { useCallback } from "react";
import { useGraphDispatch } from './scope';
import { util } from 'obsidian';
import nodes from './nodes';

function openGraph(dispatch, graphId, projectId) {
    if (projectId)
        dispatch({ type: "SET_FOCUS", focus: { projectId, graphId} });
    else
        dispatch({ type: "SET_FOCUS", focus: { graphId } });
}

function getGraphFromLocation(state, location) {
    return state.projects[location.projectId].graphs[location.graphId].present;
}

function useImportGraph(x, y) {
    let state = useSelector(state => state);
    let dispatch = useGraphDispatch();

    return useCallback((location) => {
        let graphData = getGraphFromLocation(state, location);
        let data = {
            node: { 
                name: graphData.meta.name,
                location
            },
            output: null,
        };

        dispatch({ type: "NEW_NODE", nodeType: "graph", x, y, data});
    }, [state, dispatch, x, y]);
}

function refreshInterfaces(graph, state) {
    for (let nodeId of Object.keys(graph.nodes)) {
        graph = nodes.refreshInterface(nodeId, graph, state);
    }

    return graph;
}

function traversePort(graph, port) {
    let otherPort = null;

    if (port in graph.links)
        otherPort = graph.links[port];    
    else if (Object.values(graph.links).includes(port))
        otherPort = Object.entries(graph.links).find(l => l[1] === port)[0];
    
    if (!otherPort)
        return [null, null];

    let key = graph.ports[otherPort];
    return [graph.nodes[key], key];
}

function newGraph(dispatch, name) {
    dispatch({type: "NEW_GRAPH", name});
}

function packForSerialization(graph) {
    return {
        meta: graph.present.meta,
        nodes: graph.present.nodes,
        ports: graph.present.ports,
        inputs: graph.present.inputs,
        links: graph.present.links,
        transform: graph.present.transform,
        pins: graph.present.pins,
        css: graph.present.css
    };
}

function unpackFromSerialization(data, graphId) {
    // We create fullGraph by merging a blank graph with the stored one to add
    // attributes that are not serialized, like selection and newLink information.
    let template = makeEmptyGraph(null, graphId);
    let fullGraph = util.merge(template, data);
    return newHistory([], fullGraph, []);
}

function makeEmptyGraph(name, graphId) {
    return {
        meta: {
            name,
            description: "",
            tags: "",
            hideInLibrary: false
        },
        css: `.${name} {\n\n}`,
        nodes: {},
        links: {},
        ports: {},
        pins: {},
        newLink: null,
        selection: { all: [], items: [], dragging: false },
        graphId
    }
}

export default {
    newGraph,
    packForSerialization,
    unpackFromSerialization,
    openGraph,
    useImportGraph,
    getGraphFromLocation,
    makeEmptyGraph,
    traversePort,
    refreshInterfaces
}