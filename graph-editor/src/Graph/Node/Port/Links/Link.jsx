import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './Link.css';

function Link(props) {
    let key = props.k;
    let dispatch = useDispatch();
    let selection = useSelector(state => state.graph.present.selection);
    let selected = selection.some(item => item.type === "link" && item.key === key);

    if (props.x1 === null || props.x2 === null)
        return null;

    let x1 = props.x1;
    let y1 = props.y1;
    let x2 = props.x2;
    let y2 = props.y2;

    let xm = (x1 + x2) / 2;
    let ym = (y1 + y2) / 2;

    let c = Math.min(x1 - 75, (xm + x1) / 2);
    c = Math.max(c, x1 - 0.35 * Math.abs(y1 - y2));

    let pathProps = {
        strokeLinecap: "round",
        d: `M ${x1} ${y1} Q ${c} ${y1}, ${xm} ${ym} T ${x2} ${y2}`,
        stroke: "var(--js-bright)",
        fill: "none",
        opacity: 1
    };

    if (props.dashed)
        pathProps.strokeDasharray = "0, 14, 12, 14";

    function handleClick(e) {
        dispatch({type: "SET_SELECTION", items:[{type: "link", key}]})
    }

    return (
        <g className={"Link" + (selected ? " link-selected" : "")} onClick={handleClick}>
            <path className="link-interact" {...pathProps}/>
            <path className="link-visible" {...pathProps}/>
        </g>
    );
}

export default Link;
