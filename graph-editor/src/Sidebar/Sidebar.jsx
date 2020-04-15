import React, { useState } from 'react';
import './Sidebar.css';
import NodeSidebar from './Comp/NodeSidebar/Node';
import GraphSidebar from './Comp/GraphSidebar';
import { useSelector } from 'react-redux';

function Sidebar(props) {
    let selection = useSelector(state => {
        if (!state.graph.present.meta)
            return null;

        let items = state.graph.present.selection.items;

        return items.length === 1 ? items[0] : null;
    });

    let selected = useSelector(state => {
        if (selection) {
            let graph = state.graph.present;

            if (selection.type === "node")
                return {type: "node", data: graph.nodes[selection.key], nodeKey: selection.key};

            if (selection.type === "graph")
                return {type: "graph", data: graph.meta};
        }

        return {type: null, data: null};
    });

    let [oldSelection, setOldSelection] = useState(selection);
    if (selection && (oldSelection !== selection)) {
        document.activeElement.blur();
        setOldSelection(selection);
    }

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