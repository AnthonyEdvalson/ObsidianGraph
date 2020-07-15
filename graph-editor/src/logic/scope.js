import React, { useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const GraphIdContext = React.createContext(null);
const ProjectIdContext = React.createContext(null);

function useNodeSelector(key, selector = x => x) {
    return useGraphSelector(graph => selector(graph.nodes[key]));
}

function useGraphSelector(selector) {
    let graphId = useContext(GraphIdContext);

    return useProjectSelector(project => {
        let graph = project.graphs[graphId];
        if (!graph)
            return null;

        graph = graph.present;

        if (!selector)
            return graph;

        return selector(graph);
    });
}

function useGraphDispatch() {
    let dispatch = useProjectDispatch();
    let graphId = useContext(GraphIdContext);

    return useCallback((action) => {
        dispatch({...action, graphId});
    }, [graphId, dispatch]);
}

function useProjectSelector(selector) {
    let projectId = useProjectId();

    return useSelector(state => {
        if (!projectId)
            return null;
            
        let project = state.projects[projectId];

        if (!selector)
            return project;

        return selector(project);
    });
}

function useProjectDispatch() {
    let dispatch = useDispatch();
    let projectId =  useContext(ProjectIdContext);

    return useCallback((action) => {
        dispatch({...action, projectId});
    }, [projectId, dispatch]);
}

function useProjectId() {
    return useContext(ProjectIdContext);
}

export {
    useNodeSelector,

    useGraphDispatch,
    useGraphSelector,

    useProjectDispatch,
    useProjectSelector,
    useProjectId,
    
    GraphIdContext,
    ProjectIdContext,
};
