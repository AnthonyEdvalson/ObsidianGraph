import { useSelector } from "react-redux";
import React, { useContext } from "react";
import { newHistory } from "redux-undo";

async function openGraph(id, dispatch) {
    dispatch({type: "LOAD_GRAPH", id});
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

function unpackFromSerialization(data) {
    return newHistory([], {
        ...data,
        newLink: null,
        selection: { all: [], items: [], dragging: false }
    }, []);
}

const OpenGraphContext = React.createContext(null);

function useGraphSelector(selector, graphKey) {
    let defaultGraphKey = useContext(OpenGraphContext);
    graphKey = graphKey || defaultGraphKey;

    return useSelector(state => {
        if (!graphKey)
            return null;

        if (!selector)
            selector = s => s;
        
        let graph = state.project.graphs[graphKey].present;

        if (!graph)
            return null;

        return selector(graph);
    });
}

export default {
    openGraph,
    newGraph,
    showNewGraph,
    hideNewGraph,
    packForSerialization,
    unpackFromSerialization
}

export {
    useGraphSelector,
    OpenGraphContext
}