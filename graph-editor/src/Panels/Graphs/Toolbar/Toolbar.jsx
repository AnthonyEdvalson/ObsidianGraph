import React from 'react';
import './Toolbar.css';
import { useGraphDispatch, useGraphSelector } from '../../../logic/scope';


function ToolbarNodeButton(props) {
    let t = props.t;
    const dispatch = useGraphDispatch();
    let disabled = t === "out" && props.outputExists;

    function MakeNode() {
        if (!disabled)
            dispatch({type: "NEW_NODE", nodeType: t});
    }

    return (
        <div className={"ToolbarNodeButton " + t + (disabled ? " disabled" : "")} onClick={MakeNode} title={disabled ? "An output node already exists in this graph" : ""}>
            {t.toUpperCase()}
        </div>
    )
}

function Toolbar() {
    const outputExists = useGraphSelector(graph => Object.values(graph.nodes).some(n => n.type === "out"));

    return (
        <div className="Toolbar">
            {
                ["back", "front", "agno", "data", "edit", "in", "out"].map(v => {
                    return <ToolbarNodeButton key={v} t={v} outputExists={outputExists} />
                })
            }
        </div>
    );
}


export default Toolbar;
