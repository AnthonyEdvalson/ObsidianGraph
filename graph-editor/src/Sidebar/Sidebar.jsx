import React from 'react';
import './Sidebar.css';
import NodeSidebar from './Comp/NodeSidebar/Node';
import { useSelector } from 'react-redux';

function Sidebar(props) {
    let node = useSelector(state => {
        let nodes = state.nodes;
        let select = state.selection;
        if (select in nodes)
            return nodes[select];
        
        return null;
    });

    let content = null;

    if (node) {
        content = (
            <>
                <div className="side-head">
                    <h1>{node.name}</h1>
                    <small>{node.type}</small>
                </div>
                <div className="side-body">
                    <NodeSidebar data={node}/>
                </div>
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