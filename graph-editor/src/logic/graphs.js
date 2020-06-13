import { useSelector } from "react-redux";
import React, { useContext } from "react";
import { newHistory } from "redux-undo";


function openGraph(key, dispatch) {
    dispatch({ type: "LOAD_GRAPH", key });
}

function getGraphFromLocation(location, project, packs) {
    if (location.type === "local")
        return project.graphs[location.graphId].present;

    if (location.type === "package")
        return packs[location.pack].graphs[location.graphId];
}

function importGraph(location, project, packs, dispatch, graphId) {
    let data = getGraphFromLocation(location, project, packs);
    dispatch({ type: "NEW_NODE", nodeType: "graph", location, data, graphId });
}

function newGraph(dispatch, name) {
    dispatch({type: "NEW_GRAPH", name});
}

function showNewGraph(dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "newGraph", open: true});
}
function hideNewGraph(dispatch) {
    dispatch({type: "SET_MODAL_OPEN", name: "newGraph", open: false});
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
    return newHistory([], {
        ...makeEmptyGraph(null, graphId),
        ...data
    }, []);
}

const OpenGraphContext = React.createContext(null);

function useGraphSelector(selector) {
    let graph = useContext(OpenGraphContext);

    return useSelector(state => {
        if (!graph)
            return null;

        if (!selector)
            return graph;

        return selector(graph);
    });
}

function useGraphKey() {
    return useGraphSelector(graph => graph.graphId);
}

function makeEmptyGraph(name, graphId) {
    return {
        meta: {
            name,
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
    showNewGraph,
    hideNewGraph,
    packForSerialization,
    unpackFromSerialization,
    openGraph,
    importGraph,
    getGraphFromLocation
}

export {
    useGraphSelector,
    OpenGraphContext,
    makeEmptyGraph,
    useGraphKey
}