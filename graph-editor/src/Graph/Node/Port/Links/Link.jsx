import React from 'react';
import './Link.css';
import useSelectable from '../../../useSelectable';
import { useSelector } from 'react-redux';


function Link(props) {
    let {sink, source} = props;
    let [selected, setSelect] = useSelectable("link", sink);

    let nk1 = useSelector(state => state.graph.present.ports[sink].node);
    let nk2 = useSelector(state => state.graph.present.ports[source].node);

    let n1 = useSelector(state => {let n = state.graph.present.nodes[nk1]; return {x: n.x, y: n.y, inputs: n.inputs}});
    let n2 = useSelector(state => {let n = state.graph.present.nodes[nk2]; return {x: n.x, y: n.y}});
    let i1 = n1.inputs.indexOf(sink);

    let x1 = 0 + n1.x;
    let y1 = ((200 - (n1.inputs.length - 1) * 33) + i1 * 66) / 2 + n1.y;
    let x2 = 300 + n2.x;
    let y2 = 100 + n2.y;

    let xm = (x1 + x2) / 2;
    let ym = (y1 + y2) / 2;

    let c = Math.min(x1 - 75, (xm + x1) / 2);
    c = Math.max(c, x1 - 0.35 * Math.abs(y1 - y2));

    let pathProps = {
        strokeLinecap: "round",
        d: `M ${x1} ${y1} Q ${c} ${y1}, ${xm} ${ym} T ${x2} ${y2}`,
        stroke: "var(--io-bright)",
        fill: "none",
        opacity: 1
    };

    if (props.dashed)
        pathProps.strokeDasharray = "0, 14, 12, 14";

    function handleClick(e) {
        setSelect(e);
    }

    return (
        <g className={"Link" + (selected ? " link-selected" : "")} onClick={handleClick}>
            <path className="link-interact" {...pathProps}/>
            <path className="link-visible" {...pathProps}/>
        </g>
    );
}

export default Link;
