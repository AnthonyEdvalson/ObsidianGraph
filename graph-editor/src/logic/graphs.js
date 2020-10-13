import { newHistory } from "redux-undo";
import { useSelector } from "react-redux";
import { useCallback } from "react";
import { useGraphDispatch } from './scope';
import { util } from 'obsidian';
const { getDefaultParams } = require("../UI/Schema");


function openGraph(dispatch, graphId, projectId) {
    if (projectId)
        dispatch({ type: "SET_FOCUS", focus: { projectId, graphId} });
    else
        dispatch({ type: "SET_FOCUS", focus: { graphId } });
}

function getGraphFromLocation(state, location) {
    return state.projects[location.projectId].graphs[location.graphId].present;
}

function useImportGraph() {
    let state = useSelector(state => state);
    let dispatch = useGraphDispatch();

    return useCallback((location) => {
        let graphData = getGraphFromLocation(state, location);
        let data = transformImportedGraph(graphData, location);

        dispatch({ type: "NEW_NODE", nodeType: "graph", location, data});
    }, [state, dispatch]);
}


function transformImportedGraph(graph, location) {  
    let data = {
        node: {
            location,
            parameters: null,
            schema: null,
            name: graph.meta.name,
            meta: graph.meta
        },
        inputs: [],
        output: null
    };

    for (let node of Object.values(graph.nodes)) {
        if (node.type === "in")
            data.inputs.push({ label: node.name, type: node.output.type });

        if (node.type === "out")
            data.output = { label: node.name, type: node.inputs[0].type };

        if (node.type === "edit") {
            data.node.schema = JSON.parse(node.schema);
            data.node.parameters = getDefaultParams(data.node.schema);
        }
    }
    
    return data;
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
        links: graph.present.links,
        transform: graph.present.transform
    };
}

function unpackFromSerialization(data, graphId) {
    
    // We create fullGraph by merging a blank graph with the stored one to replace
    // any lost fields, and to add new properties to outdated graphs.
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
        nodes: {},
        links: {},
        ports: {},
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
    traversePort
}