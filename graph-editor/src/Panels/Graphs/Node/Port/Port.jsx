import React from 'react';
import './Port.css';
import { util } from 'obsidian';
import { useGraphSelector, useGraphDispatch } from '../../../../logic/scope';


function Port(props) {
    let {inout} = props;
    let key = props.k;
    let label = useGraphSelector(graph => graph.ports[key].label);
    
    const dispatch = useGraphDispatch();

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey)
            dispatch({type: "RELINK", port: key, inout, transaction: util.uuid4()}); // TODO move to logic
        else
            dispatch({type: "START_LINK", port: key, inout, transaction: util.uuid4()});
    }

    const handleMouseUp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({type: "END_LINK", port: key, inout});
    }

    return (
        <div className={"Port node-io"/* + type*/}>
            <div className="port-ring" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
                <span className="port-label">{label}</span>
            </div>
        </div>
    );
}

export default Port;
