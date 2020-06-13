import React from 'react';
import { useDispatch } from 'react-redux';
import './Toolbar.css';
import { useGraphSelector, useGraphKey } from '../../../logic/graphs';


function ToolbarNodeButton(props) {
    let t = props.t;
    const dispatch = useDispatch();
    let disabled = t === "out" && props.outputExists;
    let graphId = useGraphKey();

    function MakeNode() {
        if (!disabled)
            dispatch({type: "NEW_NODE", nodeType: t, graphId});
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
                ["back", "front", "data", "edit", "in", "out"].map(v => {
                    return <ToolbarNodeButton key={v} t={v} outputExists={outputExists} />
                })
            }
        </div>
    );
}


export default Toolbar;
