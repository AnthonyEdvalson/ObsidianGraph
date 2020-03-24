import React from 'react';
import './Sidebar.css';
import NodeSidebar from './Comp/NodeSidebar/Node';
import GraphSidebar from './Comp/GraphSidebar';
import { useSelector } from 'react-redux';

function Sidebar(props) {
    let selected = useSelector(state => {
        let item = state.selection.length === 1 ? state.selection[0] : {};

        if (item.type === "node")
            return {type: "node", data: state.nodes[item.key], nodeKey: item.key};

        if (item.type === "graph")
            return {type: "graph", data: state.graph};

        return {type: null, data: null};
    });

    let content = null;

    if (selected.type === "node") {
        let node = selected.data;
        content = (
            <>
                <div className="side-head">
                    <h1>{node.name}</h1>
                    <small>NODE: {node.type.toUpperCase()}</small>
                </div>
                <NodeSidebar data={node} nodeKey={selected.nodeKey} />
            </>
        );
    }
    else if (selected.type === "graph") {
        let graph = selected.data;

        content = (
            <>
                <div className="side-head">
                    <h1>{graph.name}</h1>
                    <small>{graph.description}</small>
                </div>
                <GraphSidebar data={graph}/>
            </>
        );
    }

    return (
        <div className="Sidebar">
            {content}
        </div>
    );
}

export default Sidebar;