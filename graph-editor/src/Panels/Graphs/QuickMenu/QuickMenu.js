import React from 'react';
import { useGraphDispatch, useGraphSelector } from '../../../logic/scope';
import './QuickMenu.css';

function QuickMenu(props) {
    const outputExists = useGraphSelector(graph => Object.values(graph.nodes).some(n => n.type === "out"));

    if (!props.position)
        return null;

    let {x, y} = props.position;

    let style = {
        transform: `translate(${x}px, ${y}px) scale(${1 / props.transform.s})`
    };    


    return (
        <div className="QuickMenu" style={style}>
            <div className="click-guard"></div>
            <svg width="0" height="0">
                <defs>
                    <clipPath id="pieClip">
                        <path d="M 150 150 A 150 150 0 0 0 106.066 43.933 L 0 150 L 150 150"></path>
                    </clipPath>
                </defs>
            </svg>
            {
                ["", "edit", "in", "back", "agno", "front", "out", "data"].map((v, i) => {
                    return <QuickMenuButton key={v} t={v} i={i} outputExists={outputExists} x={x - 5000} y={y - 5000} />
                })
            }
        </div>
    )
}


function QuickMenuButton(props) {
    let t = props.t;
    const dispatch = useGraphDispatch();
    let disabled = (t === "out" && props.outputExists) || t === "";

    function MakeNode() {
        if (!disabled)
            dispatch({type: "NEW_NODE", nodeType: t, x: props.x - 150, y: props.y - 250 });
    }

    let a = (props.i + 0.5) * 360 / 8 + 90
    let style = {
        transform: `rotate(${a}deg)`
    };

    let styleInverse = {
        transform: `rotate(${-a}deg)`
    };

    return (
        <div style={style} className={t + (disabled ? " disabled" : "")} onMouseUp={MakeNode} title={disabled ? "An output node already exists in this graph" : ""}>
            <img alt={t} src={"nodes/" + t + ".png"} style={styleInverse}/>
        </div>
    )
}

export default QuickMenu;