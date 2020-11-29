import React from 'react';
import './Link.css';
import useSelectable from '../../../useSelectable';
import { useGraphSelector } from '../../../../../logic/scope';
import { util } from 'obsidian';

function usePinHeight(pinId) {
    return useGraphSelector(graph => {
        let nodeId = graph.pins[pinId].node;
        let inputs = graph.nodes[nodeId].inputs;

        let ports = inputs.map(k => graph.ports[k].pins ? [...graph.ports[k].pins, null] : [graph.ports[k].pin]);
        let height = 0;
        let totalHeight = 0;

        for (let port of ports) {
            for (let pin of port) {
                if (pinId === pin)
                    height = totalHeight;

                totalHeight += 40;
            }
            totalHeight += 20;
        }

        return [height, totalHeight - 70];
    });
}

function Link(props) {
    let { sink, source } = props;
    let { selected, setSelect } = useSelectable("link", sink);

    let n1 = useGraphSelector(graph => util.access(graph, "nodes", util.access(graph, "pins", sink, "node")));
    let n2 = useGraphSelector(graph => util.access(graph, "nodes", util.access(graph, "pins", source, "node")));
    let [height, totalHeight] = usePinHeight(sink);

    let x1 = 0 + n1.x;
    let y1 = n1.y + 250 - totalHeight / 2 + height - 5;
    
    let x2 = 300 + n2.x;
    let y2 = 500 / 2 + n2.y;

    let xm = (x1 + x2) / 2;
    let ym = (y1 + y2) / 2;

    let c = Math.min(x1 - 100, (xm + x1) / 2);
    c = Math.max(c, x1 - 0.45 * Math.abs(y1 - y2));

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
