import React from 'react';
import './Sidebar.css';
import NodeSidebar from './Comp/NodeSidebar/Node';
import GraphSidebar from './Comp/GraphSidebar';
import { useSelector } from 'react-redux';

function Sidebar(props) {
    let selected = useSelector(state => {
        if (!state.graph.present.meta)
            return null;

        let item = state.graph.present.selection.items.length === 1 ? state.graph.present.selection.items[0] : {};

        if (item.type === "node")
            return {type: "node", data: state.graph.present.nodes[item.key], nodeKey: item.key};

        if (item.type === "graph")
            return {type: "graph", data: state.graph.present.meta};

        return {type: null, data: null};
    });

    let content = null;

    if (selected && selected.type === "node") {
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
    else if (selected && selected.type === "graph") {
        let meta = selected.data;

        content = (
            <>
                <div className="side-head">
                    <h1>{meta.name}</h1>
                    <small>{meta.description}</small>
                </div>
                <GraphSidebar data={meta}/>
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