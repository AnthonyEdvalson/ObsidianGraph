import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './Toolbar.css';


function ToolbarNodeButton(props) {
    let t = props.t;
    const dispatch = useDispatch();
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
    const outputExists = useSelector(state => Object.values(state.graph.present.nodes).some(n => n.type === "out"));

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
