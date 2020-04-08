import React from 'react';
import Link from './Link';
import { useSelector } from 'react-redux';

function Links() {
    let links = useSelector(state => state.graph.present.links);
    let ports = useSelector(state => state.graph.present.ports);

    return (
        <svg className="Links" width={2000} height={2000}>
            {
                Object.entries(links).map(([sink, source]) => {
                    let p1 = ports[sink];
                    let p2 = ports[source];
                    return <Link x1={p1.x-300} y1={p1.y} x2={p2.x-300} y2={p2.y} key={sink} k={sink}></Link>
                })
            }
        </svg>
    )
}

export default Links;
